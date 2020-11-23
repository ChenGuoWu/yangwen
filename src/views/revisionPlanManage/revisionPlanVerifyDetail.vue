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
				<button class="search_btn" @click="passData('more')">批量通过</button>
				<button class="search_btn" @click="returnData('more')">批量退回</button>
				<button class="export_btn" @click="">导出</button>
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
						<el-table-column :show-overflow-tooltip="true" prop="revisionName" label="制修订名称" width="500">
							<template slot-scope="scope">
								<span style="cursor: pointer; color: #2084F2;" @click="showPopupDetail(scope.row)">{{scope.row.submitreportsName}}</span>
							</template>
						</el-table-column>
						<el-table-column prop="submitreportsNatureName" label="制/修订" width="100">
						</el-table-column>
						<el-table-column prop="submitreportsTypeName" label="类别" width="100">
						</el-table-column>
						<el-table-column prop="draftDepartment" label="起草部门" width="180">
						</el-table-column>
						<el-table-column prop="submissionDate" width="120" label="提交日期" align="center">
						</el-table-column>
						<el-table-column prop="auditStatusName" label="状态" width="100">
						</el-table-column>
						<el-table-column align="center" label="操作">
							<template slot-scope="scope">
								<el-button :disabled="scope.row.auditStatus == '2' || scope.row.auditStatus == '3'" style="padding: 0 0.1rem;" @click="passData(scope.row)" type="text" size="small">通过</el-button>
								<el-button :disabled="scope.row.auditStatus == '2' || scope.row.auditStatus == '3'" :style="{color: (scope.row.auditStatus == '2' || scope.row.auditStatus == '3') ? '#C0C4CC' : '#FF3D3D', padding:' 0 0.1rem'}" @click="returnData(scope.row)" type="text" size="small">退回</el-button>
								<el-button :disabled="scope.row.auditStatus != '3'" style="padding: 0 0.1rem;" type="text" size="small" @click="passData(scope.row)">取消通过</el-button>
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
					<el-input type="textarea" v-model="returnReason"></el-input>
				</el-form-item>
			</el-form>
		</popup>
		<popup :popupHeight="'6'" :popupWidth="'6'" :overflow="true" @cancel="showPopups = false;" v-if="showPopups" :readOnly="true" :show='showPopups' :title="'查看详情'">
			<el-form style="margin:0.2rem 0.2rem 0px 0.2rem;" ref="addForm" label-width="120px">
				<el-form :label-position="'top'" :model="addForm" ref="addForm" label-width="100px" class="demo-ruleForm">
					<el-form-item label="名称" prop="submitreportsName">
						<el-input disabled placeholder="请输入名称" v-model="addForm.submitreportsName"></el-input>
					</el-form-item>
					<el-col :span="11">
						<el-form-item prop="submitreportsNature" label="制/修订">
							<el-select disabled style="width: 100%;" v-model="addForm.submitreportsNature" clearable>
								<el-option v-for="(item, index) in systemOrRepair" :label="item.dicName" :value="item.dicCode" :key="item.dicCode"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="2"></el-col>
					<el-col :span="11">
						<el-form-item label="类别">
							<el-select disabled style="width: 100%;" v-model="addForm.submitreportsType" clearable>
								<el-option v-for="(item, index) in planType" :label="item.dicName" :value="item.dicCode" :key="item.dicCode"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="11">
						<el-form-item label="起草部门">
							<el-input disabled v-model="addForm.draftDepartment"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="2"></el-col>
					<el-col :span="11">
						<el-form-item label="主要起草人">
							<el-input disabled v-model="addForm.draftMan"></el-input>
						</el-form-item>
					</el-col>
					<el-form-item label="参与起草单位">
						<el-input disabled v-model="addForm.draftUnit"></el-input>
					</el-form-item>
					<el-col :span="11">
						<el-form-item label="开始时间" prop="draftStarttime">
							<el-date-picker disabled value-format="yyyy-MM-dd" placeholder="选择时间" v-model="addForm.draftStarttime" style="width: 100%;"></el-date-picker>
						</el-form-item>
					</el-col>
					<el-col :span="2"></el-col>
					<el-col :span="11">
						<el-form-item label="结束时间" prop="draftStarttime">
							<el-date-picker value-format="yyyy-MM-dd" placeholder="选择时间" v-model="addForm.draftEndtime" style="width: 100%;"></el-date-picker>
						</el-form-item>
					</el-col>
					<el-form-item label="制修订必要性">
						<el-input rows="4" maxlength="200" type="textarea" placeholder="请输入制修订必要性(最多可输入200字)" v-model="addForm.revisionNecessity"></el-input>
					</el-form-item>
					<el-form-item label="拟采用新技术或科技成果等">
						<el-input rows="4" maxlength="200" type="textarea" placeholder="请输入拟采用新技术或科技成果等(最多可输入200字)" v-model="addForm.achievement"></el-input>
					</el-form-item>
					<el-form-item label="主要内容">
						<el-input rows="4" maxlength="200" type="textarea" placeholder="请输入主要内容(最多可输入200字)" v-model="addForm.submitReportsContent"></el-input>
					</el-form-item>
				</el-form>
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
				showPopups: false, //是否打开详情弹窗
				popupTitle: '退回', //弹窗标题
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
					dicCode: '1',
					dicName: '待审核'
				},{
					dicCode: '2',
					dicName: '退回'
				},{
					dicCode: '3',
					dicName: '通过'
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
				addForm: {
					
				},
				planType: [],   //计划类别
				multipleSelection: [],  //多选
				revisionId: '',  //制修订计划id
				returnReason: '',  //退回原因
				
			}
		},
		created() {
			this.getPlanType();
			this.revisionId = this.$route.query.id;
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
				this.$http.post('/rule/revisionSubmitReports/getAuditRevisionSubmitReportsByCondition', data).then(res => {
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
								if(item.dicCode == items.auditStatus){
									items.auditStatusName = item.dicName;
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
			//通过/取消通过
			passData(row){
				if(row == 'more' && this.multipleSelection.length == 0){
					this.$message.warning('请选择需要操作的数据');
					return;
				}
				if(row == 'more'){
					let flag = true;
					this.multipleSelection.forEach(item => {
						if(item.auditStatus == '2'){
							flag = false;
						}
					})
					if(!flag){
						this.$message.warning('请选择待审核的数据进行操作!');
						return;
					}
				}
				this.$confirm(`您确定要${row.auditStatus == '3' ? '取消' : ''}通过该计划提报吗？`, '提示', {
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
						status = '3';
					}else{
						submitReportsIds = row.submitReportsId;
						status = row.auditStatus == '3' ? '4' : '3';
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
			//退回 / 批量退回
			returnData(row){
				if(row == 'more' && this.multipleSelection.length == 0){
					this.$message.warning('请选择需要操作的数据');
					return
				}
				if(row == 'more'){
					let flag = true;
					this.multipleSelection.forEach(item => {
						if(item.auditStatus == '3'){
							flag = false;
						}
					})
					if(!flag){
						this.$message.warning('请选择待审核的数据进行操作!');
						return;
					}
				}
				this.showPopup = true;
				this.handlerData = row;
			},
			//确定退回
			editReturn(){
				let row = this.handlerData;
				let submitReportsIds = '',
					status = '';
				if(row == 'more'){
					submitReportsIds = this.multipleSelection.map(item => {
						return item.submitReportsId
					}).join(',');
					status = '2';
				}else{
					submitReportsIds = row.submitReportsId;
					status = '2';
				}
				let data = {
					submitReportsIds: submitReportsIds,
					status: status,
					returnReason: this.returnReason
				}
				this.$http.post('/rule/revisionSubmitReports/updateStatus',data).then(res=>{
					if(res.code == '1'){
						this.$message({
							type: 'success',
							message: '操作成功!'
						});
						this.showPopup = false;
						this.init();
					}else{
						this.$message.error(res.msg);
					}
				}).catch(err => {
					console.log(err);
				})
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
			//弹窗查看详情
			showPopupDetail(row){
				this.addForm = row;
				this.showPopups = true;
			},
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
	/deep/ .el-col-2{
		height: 19px;
	}
</style>
