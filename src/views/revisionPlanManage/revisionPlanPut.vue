<template>
	<div class="organization">
		<div class="one_level">
			<div class="header">
				<div class="query_info">
					<div class="query_item">
						<span>名称</span>
						<el-input v-model="queryForm.revisionName" placeholder="请输入查询名称" class="search_query width_2rem"></el-input>
					</div>
					<div class="query_item" v-if="userRole == '1'">
						<span>一级组织机构名称</span>
						<el-select class="search_query width_2rem" v-model="queryForm.selectWorkUnits" clearable>
							<el-option v-for="(item, index) in orgnizationList" :label="item.unitName" :value="item.id" :key="item.id"></el-option>
						</el-select>
					</div>
				</div>
				<button class="search_btn" @click="init">查询</button>
			</div>
			<div class="table_content" v-loading="loading">
				<div class="table_box">
					<el-table height="100%" :header-cell-style="{background:'#E1E8F4',color:'#333333',fontWeight:'bold'}" :data="tableData" :cell-style="{padding: '0'}" :row-style="{height: '0.4rem'}" style="width: 100%; margin-bottom: 0.4rem;">
						<el-table-column type="index" label="序号" width="150" align="center">
						</el-table-column>
						<el-table-column :show-overflow-tooltip="true" prop="revisionName" label="制修订名称" width="680">
							<template slot-scope="scope">
								<span style="cursor: pointer; color: #2084F2;" @click="toRevisionPlan(scope.row)">{{scope.row.revisionName}}</span>
							</template>
						</el-table-column>
						<el-table-column prop="endDate" label="截止时间" width="470">
						</el-table-column>
						<el-table-column prop="submissionNum" label="提报数量" width="192" align='center'>
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
	import popup from '../components/popup.vue';
	export default {
		name: 'revisionPlanVerify',
		components: {
			popup
		},
		data() {
			return {
				tableData: [], //表格数据
				loading: false, //是否显示loading
				pageSizes: [10, 15, 20, 25, 30], //可选择显示条数
				pageSize: 10, //每页显示条数，默认为10
				page: 1, //当前页数，默认为1
				total: 0, //数据总条数
				showPopup: false, //是否打开弹窗
				popupTitle: '添加', //弹窗标题
				queryForm: {  //查询表单
					revisionName: '',
					selectWorkUnits: ''
				},
				orgnizationList: [],   //组织机构集合
				userRole: '',  //用户权限
			}
		},
		created() {
			if(JSON.parse(sessionStorage.getItem('userInfo')).userRole == 1){
				this.userRole = 1;
				this.$http.post('/rule/unit/getRuleUnitListByParentId', {
						id: 0
					}).then(res => {
					if (res.code == '1') {
						this.orgnizationList= res.data;
						this.queryForm.selectWorkUnits = res.data[0].id;
						this.init();
					} else {
						this.$message.error(res.msg);
					}
				}).catch(err => {
					console.log(err);
				})
			}else{
				this.queryForm.selectWorkUnits = JSON.parse(sessionStorage.getItem('userInfo')).unitId;
				this.$http.post('/rule/unit/getRuleUnitById', {
						id: JSON.parse(sessionStorage.getItem('userInfo')).unitId
					}).then(res => {
					if (res.code == '1') {
						if(res.data.unitLevel != 'DIC-004'){
							this.init();
						}
					} else {
						this.$message.error(res.msg);
					}
				}).catch(err => {
					console.log(err);
				})
			}
		},
		mounted() {},
		methods: {
			//初始化数据
			init() {
				this.loading = true;
				let data = {
					...this.queryForm,
					pageIndex: this.page,
					pageSize: this.pageSize
				};
				delete data.pubTime;
				this.$http.get('/rule/revisionManage/getRuleRevisionManageByName', data).then(res => {
					this.loading = false;
					if (res.code == '1') {
						this.tableData = res.data;
						this.total = res.pageInfo.total;
					} else {
						this.total = 0;
						this.tableData = [];
						this.$message.error(res.msg);
					}
				}).catch(err => {
					this.loading = false;
					console.log(err);
				})
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
			//跳转到制修订计划详情
			toRevisionPlan(row){
				this.$store.dispatch('changeIsAddRoute', true);
				this.$router.push({path: '/revisionPlanManage/revisionPlanPutDetail', query:{
					id: row.id
				}});
			}
		},
	}
</script>

<style scoped="scoped" lang="scss">
	.one_level {
		.header {
			height: 72px;
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
					/deep/ .el-input__inner{
						height: 32px !important;
						line-height: 32px !important;
					}
					/deep/ .el-range-editor {
					    padding: 0 10px;
						position: relative;
						top: 1px;
					}
					/deep/ .el-input__icon{
						line-height: 28px;
					}
				}
			}
			.search_query{
				width: 300px;
				margin-left: 10px;
				margin-top: 20px;
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
			}
			.pub_btn{
				position: absolute;
				right: 120px;
				top: 20px;
				width: 80px;
				height: 32px;
				background: #00479D;
				color: white;
				border-radius: 4px;
				border: 1px solid #00479D;
				line-height: 32px;
			}
			.add_btn {
				width: 100px;
				height: 32px;
				background: #00A108;
				border-radius: 4px;
				font-size: 12px;
				color: #FFFFFF;
				border: 1px solid #00A108;
				position: absolute;
				right: 20px;
				top: 20px;
				cursor: pointer;
			}
		}

		.table_content {
			height: 550px;
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
		/deep/ .el-form-item__content{
			display: flex;
		}
		.required{
			color: #F56C6C;
			position: relative;
			top: -37px;
		}
	}
	.el-form /deep/ .el-form-item__content{
		display: flex;
	}
	/deep/ .el-table__row td:last-of-type .cell{
		display: block !important;
	}
</style>
