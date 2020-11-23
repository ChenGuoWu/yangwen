<template>
	<div class="organization">
		<div class="one_level">
			<div class="header">
				<div class="query_info">
					<div class="query_item">
						<span>制/修订</span>
						<el-select class="search_query width_2rem" v-model="queryForm.submitreportsNature" clearable>
							<el-option v-for="(item, index) in systemOrRepair" :label="item.dicName" :value="item.dicCode" :key="item.dicCode"></el-option>
						</el-select>
					</div>
					<div class="query_item">
						<span>类别</span>
						<el-select class="search_query width_2rem" v-model="queryForm.submitreportsType" clearable>
							<el-option v-for="(item, index) in planType" :label="item.dicName" :value="item.dicCode" :key="item.dicCode"></el-option>
						</el-select>
					</div>
					<div class="query_item">
						<span>起草部门</span>
						<el-input v-model="queryForm.draftDepartment" placeholder="请输入起草部门" class="search_query width_2rem"></el-input>
					</div>
					<div class="query_item">
						<span>关键词</span>
						<el-input v-model="queryForm.keyWord" placeholder="请输入关键词" class="search_query width_2rem"></el-input>
					</div>
					<div class="query_item">
						<span>开始时间</span>
						<el-date-picker
							class="search_query"
						    v-model="queryForm.draftTime"
							value-format="yyyy-MM-dd"
						    type="daterange"
						    align="right"
						    unlink-panels
						    range-separator="至"
						    start-placeholder="开始日期"
						    end-placeholder="结束日期"
						    :picker-options="pickerOptions">
						</el-date-picker>
					</div>
					<div class="query_item">
						<span>状态</span>
						<el-select class="search_query width_2rem" v-model="queryForm.status" clearable>
							<el-option v-for="(item, index) in statusList" :label="item.dicName" :value="item.dicCode" :key="item.dicCode"></el-option>
						</el-select>
					</div>
				</div>
				<button class="search_btn" @click="init">查询</button>
				<button class="search_btn" @click="resizeQuery">重置</button>
				<button class="search_btn" @click="submitData('more')">批量提交</button>
				<button class="export_btn" @click="">导出</button>
				<button class="add_btn" @click="toPlanAdd('add')">新增</button>
			</div>
			<div class="table_content" v-loading="loading">
				<div class="table_box">
					<el-table height="100%" @selection-change="handleSelectionChange" :header-cell-style="{background:'#E1E8F4',color:'#333333',fontWeight:'bold'}" :data="tableData" :cell-style="{padding: '0'}" :row-style="{height: '0.4rem'}" style="width: 100%; margin-bottom: 0.4rem;">
						<el-table-column
							align="center"
							type="selection"
							width="55">
						</el-table-column>
						<el-table-column type="index" label="序号" width="100" align="center">
						</el-table-column>
						<el-table-column :show-overflow-tooltip="true" prop="revisionName" label="制修订名称" width="480">
							<template slot-scope="scope">
								<span style="cursor: pointer; color: #2084F2;" @click="toPlanAdd('', scope.row)">{{scope.row.submitreportsName}}</span>
							</template>
						</el-table-column>
						<el-table-column prop="submitreportsNatureName" label="制/修订" width="100">
						</el-table-column>
						<el-table-column prop="submitreportsTypeName" label="类别" width="100">
						</el-table-column>
						<el-table-column prop="draftDepartment" label="起草部门" width="120">
						</el-table-column>
						<el-table-column prop="draftMan" label="主要起草人" width="120">
						</el-table-column>
						<el-table-column prop="submissionDate" width="120" label="提交日期" align="center">
						</el-table-column>
						<el-table-column prop="submiterportStatusName" label="状态" width="100">
						</el-table-column>
						<el-table-column align="center" label="操作">
							<template slot-scope="scope">
								<el-button :disabled="scope.row.submiterportStatus == '1' || scope.row.submiterportStatus == '3'" style="padding: 0 0.1rem;" @click="submitData(scope.row)" type="text" size="small">提交</el-button>
								<el-button :disabled="scope.row.submiterportStatus == '1' || scope.row.submiterportStatus == '3'" :style="{color: (scope.row.submiterportStatus == '1' || scope.row.submiterportStatus == '3') ? '#C0C4CC' : '#FF3D3D', padding:' 0 0.1rem'}" @click="deleteData(scope.row)" type="text" size="small">删除</el-button>
								<el-button :disabled="scope.row.submiterportStatus != '2'" style="padding: 0 0.1rem;" type="text" size="small" @click="returnReason = scope.row.returnReason;showPopup = true;">查看</el-button>
							</template>
						</el-table-column>
					</el-table>
				</div>
				<el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="page"
				 :page-sizes="pageSizes" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
				</el-pagination>
			</div>
		</div>
		<popup :popupHeight="'2'" v-if="showPopup" @confim="editReturn" @cancel="showPopup = false;returnReason = '';" :show='showPopup' :title="popupTitle">
			<el-form style="margin:0.2rem 0.2rem 0px 0px;" ref="addForm" label-width="120px">
				<el-form-item label="退回原因" prop="returnReason">
					<el-input disabled type="textarea" v-model="returnReason"></el-input>
				</el-form-item>
			</el-form>
		</popup>
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
				popupTitle: '退回原因', //弹窗标题
				queryForm: {  //查询表单
					submitreportsNature: '',  //0 制定 1 修订
					submitreportsType: '',
					draftDepartment: '',
					keyWord: '',
					draftTime: [],
					draftStarttime: '',
					draftEndtime: '',
					status: ''
				},
				systemOrRepair: [{  //制修订数组
					dicCode: '0',
					dicName: '制订'
				},{
					dicCode: '1',
					dicName: '修订'
				}],
				statusList: [{
					dicCode: '0',
					dicName: '未提交'
				},{
					dicCode: '1',
					dicName: '已提交'
				},{
					dicCode: '2',
					dicName: '退回'
				},{
					dicCode: '3',
					dicName: '审核通过'
				}],
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
				planType: [],   //计划类别
				multipleSelection: [],  //多选
				revisionId: '',  //制修订计划id
				returnReason: '',  //退回原因
			}
		},
		created() {
			this.getPlanType();
			this.revisionId = this.$route.query.id ? this.$route.query.id : sessionStorage.getItem('revisionId');
			sessionStorage.removeItem('revisionId');
			if(sessionStorage.getItem('queryTerm')){
				let data = JSON.parse(sessionStorage.getItem('queryTerm'));
				Object.keys(this.queryForm).forEach(key => {
					this.queryForm[key] = data[key];
				})
				this.page = data.page ? data.page : 1;
				this.pageSize = data.pageSize ? data.pageSize : 10;
			}
			sessionStorage.removeItem('queryTerm');
			this.init();
		},
		mounted() {
			document.getElementsByClassName('router_box')[0].style.height = '780px';
		},
		beforeDestroy() {
			document.getElementsByClassName('router_box')[0].style.height = '710px';
		},
		methods: {
			//初始化数据
			init() {
				this.loading = true;
				let data = {
					...this.queryForm,
					pageIndex: this.page,
					pageSize: this.pageSize,
					revisionId: this.revisionId
				};
				data.draftStarttime = data.draftTime.length > 0 ? data.draftTime[0] : '';
				data.draftEndtime = data.draftTime.length > 0 ? data.draftTime[1] + '23:59:59' : '';
				delete data.draftTime;
				this.$http.post('/rule/revisionSubmitReports/getRevisionSubmitReportsByCondition', data).then(res => {
					this.loading = false;
					if (res.code == '1') {
						this.tableData = res.data;
						this.systemOrRepair.forEach(item => {
							res.data.forEach(items => {
								if(item.dicCode == items.submitreportsNature){
									items.submitreportsNatureName = item.dicName;
								}
							})
						})
						this.statusList.forEach(item => {
							res.data.forEach(items => {
								if(item.dicCode == items.submiterportStatus){
									items.submiterportStatusName = item.dicName;
								}
							})
						})
						this.planType.forEach(item => {
							res.data.forEach(items => {
								if(item.dicCode == items.submitreportsType){
									items.submitreportsTypeName = item.dicName;
								}
							})
						})
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
			//表格多选
			 handleSelectionChange(val) {
				this.multipleSelection = val;
			 },
			//发布/取消发布
			submitData(row){
				if(row == 'more' && this.multipleSelection.length == 0){
					this.$message.warning('请选择需要操作的数据');
					return
				}
				this.$confirm(`您确定要提交该计划提报吗？`, '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					let submitReportsIds = '',
						status = '';
					if(row == 'more'){
						submitReportsIds = this.multipleSelection.map(item => {
							return item.submitReportsId
						}).join(',');
						status = '1';
					}else{
						submitReportsIds = row.submitReportsId;
						status = '1';
					}
					let data = {
						submitReportsIds: submitReportsIds,
						status: status
					}
					this.$http.post('/rule/revisionSubmitReports/updateStatus',data).then(res=>{
						if(res.code == '1'){
							this.$message({
								type: 'success',
								message: '操作成功!'
							});
							this.init();
						}else{
							this.$message.error(res.msg);
						}
					}).catch(err => {
						console.log(err);
					})
				}).catch(() => {
				  this.$message({
					type: 'info',
					message: '已取消操作'
				  });
				});
			},
			//获取计划类别
			getPlanType(){
				let data = new FormData();
				data.append('dicType', 2);
				this.$http.post('/rule/dataDic/getDataDicByType', data, {
					headers: {
						"Content-Type": "application/x-www-form-urlencoded"
					}
				}).then(res => {
					if(res.code == '1'){
						this.planType = res.data;
					}
				}).catch(err => {
					console.log(err);
				})
			},
			//重置查询表单
			resizeQuery() {
				Object.keys(this.queryForm).forEach(key => {
					this.queryForm[key] = '';
				})
			},
			//制修订计划提报新增
			toPlanAdd(type, row){
				let toType = type,
					data = {
					...this.queryForm
				};
				if(toType == ''){
					toType = (row.submiterportStatus == '0' || row.submiterportStatus == '2') ? 'edit' : 'show';
				}
				if(toType != 'add'){
					data.pageSize = this.pageSize;
					data.page = this.page;
				}
				sessionStorage.setItem('queryTerm', JSON.stringify(data));
				this.$store.dispatch('changeIsAddRoute', true);
				this.$router.push({
					path: '/revisionPlanManage/revisionPlanPutAdd',
					query: {
						id: this.revisionId,
						type: type,
						handlerId: row ? row.submitReportsId : ''
					}
				})
			},
			//删除数据
			deleteData(row){
				this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					this.$http.get('/rule/revisionSubmitReports/delRevisionSubmitReports',{
						submitReportsId: row.submitReportsId
					}).then(res=>{
						if(res.code == '1'){
							this.$message({
								type: 'success',
								message: '删除成功!'
							});
							this.init();
						}else{
							this.$message.error(res.msg);
						}
					}).catch(err => {
						console.log(err);
					})
				}).catch(() => {
					this.$message({
						type: 'info',
						message: '已取消删除'
					});
				});
			}
		},
	}
</script>

<style scoped="scoped" lang="scss">
	.one_level {
		.header {
			height: 144px;
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
					margin-left: -530px;
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
</style>
