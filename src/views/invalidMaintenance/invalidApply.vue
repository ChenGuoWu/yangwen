<template>
	<div class="invalidApply">
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
					<div class="query_item">
						<span>审核状态</span>
						<el-select class="search_query width_2rem" v-model="queryForm.auditStatus" filterable clearable>
							<el-option v-for="item in auditStatusList" :label="item.dicName" :value="item.dicCode" :key="item.dicCode"></el-option>
						</el-select>
					</div>
					<div class="query_item">
						<span>失效时间</span>
						<el-date-picker
							class="search_query"
						    v-model="queryForm.invalidTime"
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
					<button class="search_btn" @click="init">查询</button>
					<button class="search_btn" @click="resizeQueryForm">重置</button>
				</div>
			</div>
			<div class="table_content" v-loading="loading">
				<div class="table_box">
					<el-table height="100%" :header-cell-style="{background:'#E1E8F4',color:'#333333',fontWeight:'bold'}" :data="tableData" :cell-style="{padding: '0'}" :row-style="{height: '0.4rem'}" style="width: 100%; margin-bottom: 0.2rem;">
						<el-table-column type="index" align="center" label="序号" width="60">
						</el-table-column>
						<el-table-column :show-overflow-tooltip="true" prop="ruleNo" label="规章编号" width="150">
						</el-table-column>
						<el-table-column :show-overflow-tooltip="true" prop="ruleTitle" label="规章名称" width="300">
							<template slot-scope="scope">
								<span style="cursor: pointer; color: #2084F2;">{{scope.row.ruleTitle}}</span>
							</template>
						</el-table-column>
						<el-table-column :show-overflow-tooltip="true" prop="ruleDocNo" label="规章文号" width="150">
						</el-table-column>
						<el-table-column prop="ruleImplDate" label="施行时间" width="150">
						</el-table-column>
						<el-table-column prop="ruleExpStatusName" label="规章状态" width="80">
						</el-table-column>
						<el-table-column prop="ruleExpDate" label="失效时间" width="150">
						</el-table-column>
						<el-table-column :show-overflow-tooltip="true" prop="ruleExpCauseName" label="失效原因" width="180">
						</el-table-column>
						<el-table-column prop="auditStatusName" label="审核状态" width="120">
						</el-table-column>
						<el-table-column align="center" label="操作" width="320" fixed="right">
							<template slot-scope="scope">
								<el-button :disabled="!!(scope.row.auditStatus)" @click="applyInvalid(scope.row)" :style="{color: (!!(scope.row.auditStatus)) ? '#C0C4CC' : '#00A108', padding: '0 0.15rem'}" type="text" size="small">提请失效</el-button>
								<el-button :disabled="!scope.row.auditStatus || scope.row.auditStatus != '1'" @click="cancelApply(scope.row)" :style="{color: (!scope.row.auditStatus || scope.row.auditStatus != '1') ? '#C0C4CC' : '#FF9829', padding: '0 0.15rem'}" type="text" size="small">取消提请失效</el-button>
								<el-button :disabled="!scope.row.auditStatus || scope.row.auditStatus == '1'" style="padding: 0 0.15rem;" @click="viewData(scope.row)" type="text" size="small">查看</el-button>
							</template>
						</el-table-column>
					</el-table>
				</div>
				<el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="page"
				 :page-sizes="pageSizes" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
				</el-pagination>
			</div>
		</div>
		<popup :readOnly="popupReadOnly" :confimText="confimText" v-loading="popupLoading" :popupHeight="popupHeight" v-if="showPopup" @confim="saveData" @cancel="showPopup = false;resizeAddForm()" :show='showPopup' :title="popupTitle">
			<div v-if="handlerRow.auditStatus == 2" class="reject_reason">
				<span>退回原因</span>
				<span>{{returnReason}}</span>
			</div>
			<el-form v-if="handlerRow.auditStatus != 3" style="margin:0.2rem 0.44rem 0px 0px;" ref="addForm" :rules="rules" :model="addForm" label-width="100px">
				<el-form-item label="失效原因" prop="ruleExpCause">
					<el-select v-model="addForm.ruleExpCause" filterable clearable>
						<el-option v-for="item in failureReasonList" :label="item.dicName" :value="item.dicCode" :key="item.dicCode"></el-option>
					</el-select>
				</el-form-item>
				<div class="invalid_relation">
					<div class="box_header">
						<span class="label">失效依据</span>
						<el-button @click="checkFile">选择</el-button>
					</div>
					<div class="line"></div>
					<div class="box_content">
						<el-upload
						  class="upload-demo"
						  ref="upload"
						  multiple
						  action=""
						  :http-request="uploadRequest"
						  :on-preview="handlePreview"
						  :on-remove="handleRemove"
						  :file-list="fileList">
						  <el-button style="display: none;" class="check_file" slot="trigger" size="small" type="primary">选取文件</el-button>
						</el-upload>
					</div>
				</div>
				<el-form-item label="失效时间" prop="ruleExpDate">
					<el-date-picker value-format="yyyy-MM-dd" type="date" placeholder="选择日期" v-model="addForm.ruleExpDate" style="width: 100%;"></el-date-picker>
				</el-form-item>
				<el-form-item label="备注">
					<el-input type="textarea" v-model="addForm.remark"></el-input>
				</el-form-item>
			</el-form>
			<div class="pass_box" v-if="handlerRow.auditStatus == 3">
				<div class="pass_item">
					<span>失效时间</span>
					<span>{{addForm.ruleExpDate}}</span>
				</div>
				<div class="pass_item">
					<span>失效原因</span>
					<span>{{handlerRow.ruleExpCauseName}}</span>
				</div>
			</div>
		</popup>
	</div>
</template>

<script>
	import popup from '../components/popup.vue';
	import orgTree from '../components/orgTree.vue';
	export default {
		name: 'invalidApply',
		components: {
			popup,
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
				showPopup: false, //是否打开弹窗
				popupTitle: '添加', //弹窗标题
				addForm: {
					ruleExpCause: '',
					ruleExpDate: '',
					remark: ''
				},
				rules: {
					ruleExpCause: [{
						required: true,
						message: '请选择失效原因',
						trigger: 'blur'
					}],
					 ruleExpDate: [{
						required: true,
						message: '请选择失效时间',
						trigger: 'blur'
					}],
				},
				popupLoading: false,  //弹窗loading
				queryForm: {  //查询表单
					ruleTitle: '',					ruleDocNo: '',					ruleNo: '',					ruleDomain: '',
					pubTime: [],
					invalidTime: [],
					ruleImplDateStart: '',
					ruleImplDateEnd: '',
					ruleExpDateStart: '',					ruleExpDateEnd: '',
					ruleExpStatus: '',
					auditStatus: '',
					ruleFileStatus: 0
				},
				editId: '', //修改数据id
				auditStatusList: [{   //审核状态
					dicName: '默认状态',
					dicCode: '0'
				},{
					dicName: '正在审核',
					dicCode: '1'
				},{
					dicName: '被退回',
					dicCode: '2'
				},{
					dicName: '审核通过',
					dicCode: '3'
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
				ruleStatusList: [],  //规章状态集合
				failureReasonList: [],  //失效原因
				fileList: [],  //文件集合
				fileIdList: [],  //文件id集合
				handlerRow: '',  //操作的表格单行数据
				popupHeight: '4.63',   //弹窗高度
				popupReadOnly: false,   //弹窗是否显示底部按钮
				returnReason: '', // 退回原因
				confimText: '确定',  //弹窗确定文字
				currentNode: '',  //当前规章分类id
			}
		},
		created() {
			this.getRuleStatus();
			this.getFailureReason();
		},
		mounted() {},
		methods: {
			//初始化数据
			init() {
				if(!this.currentNode){
					this.$message.warning('请先在左侧选中规章分类');
					return
				}
				this.loading = true;
				let requestUrl = '/rule/prop/selectAllProp',
					data = {
						...this.queryForm,
						pageIndex: this.page,
						pageSize: this.pageSize,
						ownClassId: this.currentNode.classId
					};
					data.ruleImplDateStart = data.pubTime && data.pubTime.length > 0 ? data.pubTime[0] + ' 00:00:00' : '';
					data.ruleImplDateEnd = data.pubTime && data.pubTime.length > 0 ? data.pubTime[1] + ' 23:59:59' : '';
					data.ruleExpDateStart = data.invalidTime && data.invalidTime.length > 0 ? data.invalidTime[0] + ' 00:00:00' : '';
					data.ruleExpDateEnd = data.invalidTime && data.invalidTime.length > 0 ? data.invalidTime[0] + ' 23:59:59' : '';
					delete data.pubTime;
					delete data.invalidTime;
				this.$http.post(requestUrl, data).then(res => {
					this.loading = false;
					if (res.code == '1') {
						res.data.forEach(item => {
							this.ruleStatusList.forEach(items => {
								if(item.ruleExpStatus == items.dicCode){
									item.ruleExpStatusName = items.dicName;
								}
							})
							this.failureReasonList.forEach(items => {
								if(item.ruleExpCause == items.dicCode){
									item.ruleExpCauseName = items.dicName;
								}
							})
							this.auditStatusList.forEach(items => {
								if(item.auditStatus == items.dicCode){
									item.auditStatusName = items.dicName;
								}
							})
						})
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
			//提请失效
			applyInvalid(row){
				this.handlerRow = row;
				this.popupTitle = '提请失效';
				this.popupHeight = '4.63';
				this.confimText = '确定';
				this.popupReadOnly = false;
				this.showPopup = true;
			},
			//查看数据
			viewData(row){
				this.handlerRow = row;
				this.popupTitle = row.auditStatus == '2' ? '被退回' : '审核通过';
				this.confimText = '再次提请';
				let data = new FormData();
				data.append('ruleId', row.ruleId);
				this.$http.post('/rule/prop/getPropByRuleId', data, {
					headers: {
						"Content-Type": "application/x-www-form-urlencoded"
					}
				}).then(res => {
					if(res.code == 1){
						Object.keys(this.addForm).forEach(key => {
							this.addForm[key] = res.data[key];
						})
						this.returnReason = res.data.returnReason;
						if(row.auditStatus == '2' && res.data.ruleExpBasis && res.data.ruleExpBasisName){
							this.fileIdList = res.data.ruleExpBasis.split(',');
							this.fileIdList.forEach((id, index) => {
								this.fileList.push({
									fileId: id,
									name: res.data.ruleExpBasisName[index]
								})
							})
						}
						this.popupHeight = row.auditStatus == '2' ? '5' : '1.2';
						this.popupReadOnly = row.auditStatus != '2';
						this.showPopup = true;
					}else{
						this.$message.error(res.msg);
					}
				}).catch(err => {
					console.log(err);
				})
			},
			//树节点点击触发事件
			clickHandler(nodeData){
				this.currentNode = nodeData;
				this.init();
			},
			//取消提请失效
			cancelApply(row){
				this.$confirm('您确定要取消提请失效吗?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					let data = {
						ruleId: row.ruleId,
						flag: 3
					};
					this.$http.post('/rule/prop/AuditOperation',data).then(res=>{
						if(res.code == '1'){
							this.$message({
								type: 'success',
								message: '取消成功!'
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
			//重置查询条件
			resizeQueryForm(){
				Object.keys(this.queryForm).forEach(key => {
					this.queryForm[key] = null;
					if(key == 'pubTime'){
						this.queryForm[key] = [];
					}
					if(key == 'invalidTime'){
						this.queryForm[key] = [];
					}
				})
			},
			//重置失效申请添加字段
			resizeAddForm(){
				Object.keys(this.addForm).forEach(key => {
					this.addForm[key] = '';
				})
				this.fileIdList = [];
				this.fileList = [];
			},
			//自定义上传参数
			uploadRequest(params){
				let data = new FormData();
				data.append('file',params.file);//传文件
				data.append('topUnitId', this.handlerRow.topUnitId);
				this.$http.post('/rule/file/uploadRuleFile', data, {
					headers: {
						"Content-Type": "application/x-www-form-urlencoded"
					}
				}).then(res => {
					if (res.code == '1') {
						this.fileList.push({
							name: res.data.ruleFileName,
							fileId: res.data.id
						})
						this.fileIdList.push(res.data.id);
					} else {
						this.$message.error(res.msg);
					}
				}).catch(err => {
					console.log(err);
				})
			},
			//点击查看文件
			handlePreview(file){
				console.log(file);
			},
			//点击移除文件
			handleRemove(file, fileList){
				this.fileIdList = this.fileIdList.filter(item => {
					return item !== file.fileId
				})
				this.$http.post('/rule/file/delRuleFile', {
					id: file.fileId
				}).then(res => {
					if(res.code == '1'){
						this.$message.success('移除成功');
					}
				}).catch(err => {
					console.log(err);
				})
			},
			//提请失效
			saveData(){
				this.$refs['addForm'].validate((valid) => {
					if(valid){
						this.popupLoading = true;
						let data = {
							...this.addForm,
							ruleId: this.handlerRow.ruleId,
							topUnitId: this.handlerRow.topUnitId,
							ruleExpBasis: this.fileIdList.join(','),
							flag: 0
						};
						this.$http.post('/rule/prop/AuditOperation', data).then(res => {
							if(res.code == 1){
								this.popupLoading = false;
								this.showPopup = false;
								this.resizeAddForm();
								this.init();
							}else{
								this.popupLoading = false;
								this.$message.error(res.msg);
							}
						}).catch(err => {
							this.popupLoading = false;
							console.log(err);
						})
					}else{
						this.$message.warning('请确认必填项是否填写完整!');
					}
				});
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
						this.ruleStatusList = res.data;
					}else{
						this.$message.error(msg);
					}
				}).catch(err => {
					console.log(err);
				})
			},
			//获取失效原因
			getFailureReason(){
				let data = new FormData();
				data.append('dicType', 5);
				this.$http.post('/rule/dataDic/getDataDicByType', data, {
					headers: {
						"Content-Type": "application/x-www-form-urlencoded"
					}
				}).then(res => {
					if(res.code == '1'){
						this.failureReasonList = res.data;
					}else{
						this.$message.error(msg);
					}
				}).catch(err => {
					console.log(err);
				})
			},
			//选择文件
			checkFile(){
				document.querySelector('.check_file').click();
			}
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
	.reject_reason{
		width: 100%;
		min-height:36px;
		background: #F4F7FC;
		font-size: 14px;
		line-height: 36px;
		display: flex;
		span:first-of-type{
			padding-left: 52px;
			padding-right: 12px;
		}
		span:nth-of-type(2){
			display: inline-block;
			width: 350px;
			overflow : hidden;
			text-overflow: ellipsis;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
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
	.invalid_relation{
		.box_header{
			display: flex;
			justify-content: space-between;
			.label{
				display: inline-block;
				width: 108px;
				font-size: 14px;
				text-align: right;
				padding-right: 12px;
				color: #606266;
			}
			.el-button{
				height: 32px;
				padding: 0;
				line-height: 32px;
				width: 60px;
			}
		}
		.line{
			width: calc(100% - 50px);
			margin-left: 50px;
			height: 2px;
			background: #DADADA;
			opacity: 0.6;
			margin-top: 8px;
			margin-bottom: 8px;
		}
		.box_content{
			margin-left: 120px;
			max-height: 100px;
			overflow-y: auto;
		}
		/deep/ .upload-demo{
			position: relative;
			top: -25px;
		}
	}
	.pass_box{
		.pass_item{
			line-height: 36px;
			span:first-of-type{
				margin-left: 20px;
				color: #333333;
				font-weight: bold;
				padding-right: 20px;
			}
		}
	}
	/deep/ .el-list-enter-active,
	/deep/ .el-list-leave-active {
	    transition: none;
	}
	
	/deep/ .el-list-enter,
	/deep/ .el-list-leave-active {
	    opacity: 0;
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