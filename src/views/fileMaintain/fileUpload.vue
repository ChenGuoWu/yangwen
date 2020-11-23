<template>
	<div class="organization">
		<org-tree @nodeClick="clickHandler"></org-tree>
		<div class="one_level">
			<div class="header">
				<div class="query_info">
					<div class="query_item">
						<span>规章名称</span>
						<el-input v-model="queryForm.ruleTitle" placeholder="请输入规章名称" class="search_query width_2rem"></el-input>
					</div>
					<div class="query_item">
						<span>规章文号</span>
						<el-input v-model="queryForm.ruleDocNo" placeholder="请输入规章文号" class="search_query width_2rem"></el-input>
					</div>
					<div class="query_item">
						<span>规章编号</span>
						<el-input v-model="queryForm.ruleNo" placeholder="请输入规章编号" class="search_query width_2rem"></el-input>
					</div>
					<div class="query_item">
						<span>施行时间</span>
						<el-date-picker
							class="search_query"
						    v-model="queryForm.pubTime"
						    type="daterange"
						    align="right"
						    unlink-panels
							value-format="yyyy-MM-dd"
						    range-separator="至"
						    start-placeholder="开始日期"
						    end-placeholder="结束日期"
						    :picker-options="pickerOptions">
						</el-date-picker>
					</div>
					<div class="query_item">
						<span>规章状态</span>
						<el-select class="search_query width_2rem" v-model="queryForm.ruleExpStatus" filterable clearable>
							<el-option v-for="item in ruleStatusList" :label="item.dicName" :value="item.dicCode" :key="item.dicCode"></el-option>
						</el-select>
					</div>
					<button class="search_btn" @click="init">查询</button>
					<button class="search_btn" @click="resizeQueryForm">重置</button>
				</div>
			</div>
			<div class="table_content" v-loading="loading">
				<div class="table_box">
					<el-table  height="100%" @selection-change="handleSelectionChange" :header-cell-style="{background:'#E1E8F4',color:'#333333',fontWeight:'bold'}" :data="tableData" :cell-style="{padding: '0'}" :row-style="{height: '0.4rem'}" style="width: 100%; margin-bottom: 0.2rem;">
						<el-table-column
							align="center"
							type="selection"
							width="55">
						</el-table-column>
						<el-table-column type="index" align="center" label="序号" width="60">
						</el-table-column>
						<el-table-column :show-overflow-tooltip="true" prop="ruleTitle" label="规章名称" width="400">
							<template slot-scope="scope">
								<span style="cursor: pointer; color: #2084F2;" @click="lookRuleDetail(scope.row.ruleId)">{{scope.row.ruleTitle}}</span>
							</template>
						</el-table-column>
						<el-table-column :show-overflow-tooltip="true" prop="ruleDocNo" label="规章文号" width="200">
						</el-table-column>
						<el-table-column :show-overflow-tooltip="true" prop="ruleNo" label="规章编号" width="200">
						</el-table-column>
						<el-table-column prop="ruleImplDate" label="施行时间" width="150">
						</el-table-column>
						<el-table-column prop="ruleExpStatusName" label="规章状态" width="80">
						</el-table-column>
						<el-table-column align="center" label="操作">
							<template slot-scope="scope">
								<el-button style="margin: 0 auto;" @click="uploadFile(scope.row.ruleId)" type="text" size="small">上传文件</el-button>
							</template>
						</el-table-column>
					</el-table>
				</div>
				<el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="page"
				 :page-sizes="pageSizes" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
				</el-pagination>
			</div>
		</div>
	</div>
</template>

<script>
	import orgTree from '../components/orgTree.vue';
	export default {
		name: 'fileUpload',
		components: {
			orgTree
		},
		data() {
			return {
				tableData: [], //表格数据
				loading: false, //是否显示loading
				pageSizes: [10, 15, 20, 25, 30], //可选择显示条数
				pageSize: 10, //每页显示条数，默认为10
				page: 1, //当前页数，默认为1
				total: 0, //数据总条数
				queryForm: {  //查询表单
					ruleTitle: '',					ruleDocNo: '',					ruleNo: '',
					pubTime: [],
					ruleImplDateStart: '',
					ruleImplDateEnd: '',
					ruleExpStatus: '',
					ruleFileStatus: 0
				},
				editId: '', //修改数据id
				pickerOptions: {
				  shortcuts: [{
					text: '最近一周',
					onClick(picker) {
					  const end = new Date();
					  const start = new Date();
					  start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
					  picker.$emit('pick', [start, end]);
					}
				  }, {
					text: '最近一个月',
					onClick(picker) {
					  const end = new Date();
					  const start = new Date();
					  start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
					  picker.$emit('pick', [start, end]);
					}
				  }, {
					text: '最近三个月',
					onClick(picker) {
					  const end = new Date();
					  const start = new Date();
					  start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
					  picker.$emit('pick', [start, end]);
					}
				  }]
				},
				multipleSelection: [],  //表格多选数据集合
				rulesList: [],   //规章类别
				ruleStatusList: [],  //规章状态集合
				userInfo: {},  //用户信息
				orgInfo: {},  //组织机构信息
				currentNode: '',  //当前树节点Id
			}
		},
		created() {},
		mounted() {
			this.userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
			this.getRulesType();
			this.getRuleStatus();
			if(this.userInfo.unitId){
				this.getOrgInfo();
			}
		},
		methods: {
			//初始化数据
			init() {
				this.loading = true;
				let requestUrl = '/rule/prop/selectAllProp',
					data = {
						...this.queryForm,
						ownClassId: this.currentNode.classId,
						pageIndex: this.page,
						pageSize: this.pageSize
					};
					data.ruleImplDateStart = data.pubTime && data.pubTime.length > 0 ? data.pubTime[0] + ' 00:00:00' : '';
					data.ruleImplDateEnd = data.pubTime && data.pubTime.length > 0 ? data.pubTime[1] + ' 23:59:59' : '';
					delete data.pubTime;
				this.$http.post(requestUrl, data).then(res => {
					this.loading = false;
					if (res.code == '1') {
						res.data.forEach(item => {
							this.ruleStatusList.forEach(items => {
								if(item.ruleExpStatus == items.dicCode){
									item.ruleExpStatusName = items.dicName;
								}
							})
						})
						this.tableData = res.data;
						this.total = res.pageInfo.total;
					} else {
						this.$message.error(res.msg);
					}
				}).catch(err => {
					this.loading = false;
					console.log(err);
				})
			},
			//树节点点击触发事件
			clickHandler(nodeData){
				this.currentNode = nodeData;
				this.init();
			},
			//修改每页显示条数
			handleSizeChange(val) {
				this.pageSize = val;
				this.page = 1;
				this.init();
			},
			//修改当前显示页
			handleCurrentChange(val) {
				this.page = val;
				this.init();
			},
			//表格多选事件
			handleSelectionChange(val){
				this.multipleSelection = val;
			},
			//重置查询条件
			resizeQueryForm(){
				Object.keys(this.queryForm).forEach(key => {
					this.queryForm[key] = null;
					if(key == 'pubTime'){
						this.queryForm[key] = [];
					}
					if(key == 'ruleFileStatus'){
						this.queryForm[key] = 0;
					}
				})
			},
			//上传文件
			uploadFile(id){
				sessionStorage.setItem('node', JSON.stringify(this.currentNode));
				this.$store.dispatch('changeIsAddRoute', true);
				this.$router.push({path: '/fileMaintain/uploadFile', query: {
					id: id
				}});
			},
			//获取规章类别List
			getRulesType(){
				let data = new FormData();
				data.append('dicType', 2);
				this.$http.post('/rule/dataDic/getDataDicByType', data, {
					headers: {
						"Content-Type": "application/x-www-form-urlencoded"
					}
				}).then(res => {
					if(res.code == '1'){
						this.rulesList = res.data;
					}else{
						this.$message.error(msg);
					}
				}).catch(err => {
					console.log(err);
				})
			},
			//查看规章文件详情
			lookRuleDetail(id){
				this.$router.push({path: '/titleMaintenance/ruleFileDetail', query: {
					id: id
				}});
			},
			//获取规章状态
			getRuleStatus(){
				let data = new FormData();
				data.append('dicType', 4);
				this.$http.post('/rule/dataDic/getDataDicByType', data, {
					headers: {
						"Content-Type": "application/x-www-form-urlencoded"
					}
				}).then(res => {
					if(res.code == '1'){
						this.ruleStatusList = res.data.filter(item => {
							return item.dicCode != 'DIC-0021' && item.dicCode != 'DIC-0022';
						});
					}else{
						this.$message.error(msg);
					}
				}).catch(err => {
					console.log(err);
				})
			},
			//根据用户id获取组织机构信息
			getOrgInfo(){
				let data = new FormData();
				data.append('id', this.userInfo.unitId);
				this.$http.post('/rule/unit/getRuleUnitById', data, {
					headers: {
						"Content-Type": "application/x-www-form-urlencoded"
					}
				}).then(res => {
					if(res.code == '1'){
						this.orgInfo = res.data;
					}
				}).catch(err => {
					console.log(err);
				})
			},
		},
	}
</script>

<style scoped="scoped" lang="scss">
	.one_level {
		width: 84%;
		float: left;
		margin-left: 20px;
		.header {
			height: 124px;
			width: 100%;
			background: #FFFFFF;
			box-shadow: 0px 4px 7px 1px rgba(84, 137, 199, 0.09);
			border-radius: 10px;
			position: relative;
			.query_info{
				display: inline-block;
				.query_item{
					display: inline-block;
					span{
						font-size: 14px;
						padding-left: 20px;
					}
					/deep/ .el-input__icon {
						line-height: 32px;
					}
				}
			}
			.search_query{
				width: 300px;
				margin-left: 10px;
				margin-top: 20px;
				/deep/ .el-input__inner{
					height: 32px !important;
					line-height: 32px !important;
				}
			}
			.search_btn{
				width: 80px;
				height: 32px;
				background: #00479D;
				color: white;
				margin-top: 20px;
				margin-left: 20px;
				border-radius: 4px;
				border: 1px solid #00479D;
				line-height: 32px;
				&:first-of-type{
					margin-left: 80px;
				}
			}
			.export_btn{
				width: 80px;
				height: 32px;
				background: #ffffff;
				color: #00479D;
				margin-top: 20px;
				margin-left: 20px;
				border-radius: 4px;
				border: 1px solid #00479D;
				line-height: 32px;
			}
			.add_btn {
				width: 80px;
				height: 32px;
				background: #00A108;
				border-radius: 4px;
				font-size: 12px;
				color: #FFFFFF;
				border: 1px solid #00A108;
				margin-top: 20px;
				margin-left: 20px;
				cursor: pointer;
			}
		}

		.table_content {
			height: 500px;
			padding: 20px;
			background: #FFFFFF;
			box-shadow: 0px 4px 7px 1px rgba(84, 137, 199, 0.09);
			border-radius: 10px;
			margin-top: 20px;
		}
	}
	.is_required{
		/deep/ .el-form-item__label{
			padding-left: 10px !important;
			&::before{
				content: "*";
				color: #F56C6C;
				margin-right: 4px;
			}
		}
		.required{
			color: #F56C6C;
			position: relative;
			top: -37px;
		}
	}
	.role_number{
		/deep/ .el-form-item__content{
			height: auto;
			line-height: 1;
		}
		.number_item{
			display: flex;
			flex-flow: column;
			padding: 0 5px;
			.number_key{
				width: 32px;
				/deep/ .el-input__inner{
					padding: 0 5px;
					width: 32px;
					height: 32px;
					line-height: 32px;
				}
			}
			span{
				font-size: 12px;
				padding-top: 5px;
				color: #999999;
			}
			&:nth-of-type(2){
				span{
					font-size: 20px;
					padding: 5px;
				}
			}
			&:nth-last-of-type(2){
				span{
					font-size: 20px;
					padding: 5px;
				}
			}
			&:last-of-type{
				/deep/ .el-input__inner{
					width: 52px;
				}
			}
		}
	}
	.el-form /deep/ .el-form-item__content{
		display: flex;
	}
	.query_item /deep/ .el-range-editor{
		padding: 0 !important;
		height: 32px !important;
		line-height: 32px !important;
	}
</style>
<style>
	.el-date-picker__header .el-date-picker__header-label {
	    float: left;
	    position: relative;
	    bottom: 4px;
	    left: 33px;
	}
	.el-date-picker .el-picker-panel__icon-btn{
		margin-top: 0;
	}
</style>