<template>
	<div class="organization">
		<org-tree @nodeClick="clickHandler"></org-tree>
		<div class="one_level">
			<div class="header">
				<div class="query_info">
					<div class="query_item">
						<span>规章标题</span>
						<el-input v-model="queryForm.ruleTitle" placeholder="请输入规章标题" class="search_query width_2rem"></el-input>
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
						<span>专业</span>
						<el-select v-model="queryForm.ruleDomain" filterable clearable class="search_query width_2rem">
							<el-option v-for="item in majorList" :label="item.dicName" :value="item.dicCode" :key="item.dicCode"></el-option>
						</el-select>
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
						<span>有无规章文件</span>
						<el-select class="search_query width_2rem" v-model="queryForm.ruleFileStatus" filterable clearable>
							<el-option v-for="item in ruleFileStatusList" :label="item.label" :value="item.value" :key="item.value"></el-option>
						</el-select>
					</div>
					<button class="search_btn" @click="init">查询</button>
					<button class="search_btn" @click="resizeQueryForm">重置</button>
					<button class="export_btn">数据导出</button>
				</div>
			</div>
			<div class="table_content" v-loading="loading">
				<div class="table_box">
					<el-table height="100%" @selection-change="handleSelectionChange" :header-cell-style="{background:'#E1E8F4',color:'#333333',fontWeight:'bold'}" :data="tableData" :cell-style="{padding: '0'}" :row-style="{height: '0.4rem'}" style="width: 100%; margin-bottom: 0.2rem;">
						<el-table-column
							align="center"
							type="selection"
							width="55">
						</el-table-column>
						<el-table-column type="index" align="center" label="序号" width="60">
						</el-table-column>
						<el-table-column :show-overflow-tooltip="true" prop="ruleTitle" label="规章标题" width="260">
							<template slot-scope="scope">
								<span style="cursor: pointer; color: #2084F2;" @click="lookRuleDetail(scope.row.ruleId)">{{scope.row.ruleTitle}}</span>
							</template>
						</el-table-column>
						<el-table-column :show-overflow-tooltip="true" prop="ruleDocNo" label="规章文号" width="140">
						</el-table-column>
						<el-table-column :show-overflow-tooltip="true" prop="ruleNo" label="规章编号" width="140">
						</el-table-column>
						<el-table-column prop="ruleDomainName" label="专业" width="80">
						</el-table-column>
						<el-table-column prop="ruleImplDate" label="施行时间" width="150">
						</el-table-column>
						<el-table-column prop="ruleExpStatus" label="有无规章文件" width="110">
							<template slot-scope="scope">
								<span>{{scope.row.ruleExpStatus == 1 ? '有' : '无'}}</span>
							</template>
						</el-table-column>
						<el-table-column prop="ruleExpStatusName" label="规章状态" width="80">
						</el-table-column>
						<el-table-column align="center" label="操作">
							<template slot-scope="scope">
								<el-button v-if="scope.row.ruleExpStatus == 'DIC-0019' || scope.row.ruleExpStatus == 'DIC-0020'" style="padding: 0 0.15rem;" @click="editData(scope.row)" type="text" size="small">编辑</el-button>
								<el-button v-if="(scope.row.ruleExpStatus == 'DIC-0019' || scope.row.ruleExpStatus == 'DIC-0020') && scope.row.ruleExpStatus != '1'" style="color: #FF3D3D; padding: 0 0.15rem;" @click="deleteData(scope.row)" type="text" size="small">删除</el-button>
							</template>
						</el-table-column>
					</el-table>
				</div>
				<el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="page"
				 :page-sizes="pageSizes" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
				</el-pagination>
			</div>
		</div>
		<popup v-loading="popupLoading" :popupHeight="'6.63'" v-if="showPopup" @confim="saveData" @cancel="showPopup = false;resizeForm()" :show='showPopup' :title="popupTitle">
			<el-form style="margin:0.2rem 0.2rem 0px 0px;" ref="addForm" :rules="rules" :model="addForm" label-width="120px">
				<el-form-item prop="ruleTitle" label="技术规章标题">
					<el-input v-model="addForm.ruleTitle"></el-input>
				</el-form-item>
				<el-form-item class="role_number"  label="技术规章编号" v-if="orgInfo.unitLevel != 'DIC-004'">
					<div class="number_item">
						<el-input v-model="addForm.ruleNoCode" class="number_key"></el-input>
						<span>规章</span>
					</div>
					<div class="number_item">
						<span>/</span>
					</div>
					<div class="number_item">
						<el-input v-model="addForm.ruleNoDomain" class="number_key"></el-input>
						<span>专业</span>
					</div>
					<div class="number_item">
						<el-input v-model="addForm.ruleNoSn" class="number_key"></el-input>
						<span>顺序</span>
					</div>
					<div class="number_item">
						<el-input v-model="addForm.ruleNoRev" class="number_key"></el-input>
						<span>修订</span>
					</div>
					<div class="number_item">
						<span>——</span>
					</div>
					<div class="number_item">
						<el-input v-model="addForm.ruleNoYear" class="number_key"></el-input>
						<span>发布年号</span>
					</div>
				</el-form-item>
				<el-form-item class="is_required" label="规章文号" v-if="orgInfo.unitLevel != 'DIC-004'">
					<el-input class="writing_item" v-model="addForm.ruleDocNo1"></el-input>
					<span style="padding: 0 0.05rem;">〔</span>
					<el-input class="writing_item" v-model="addForm.ruleDocNo2"></el-input>
					<span style="padding: 0 0.05rem;">〕</span>
					<el-input class="writing_item" v-model="addForm.ruleDocNo3"></el-input>
					<span>号</span>
				</el-form-item>
				<el-form-item label="技术规章编号" prop="ruleNo" v-if="orgInfo.unitLevel == 'DIC-004'">
					<el-input v-model="addForm.ruleNo"></el-input>
				</el-form-item>
				<el-form-item label="规章文号" prop="ruleDocNo" v-if="orgInfo.unitLevel == 'DIC-004'">
					<el-input v-model="addForm.ruleDocNo"></el-input>
				</el-form-item>
				<el-form-item label="负责部门" prop="deptInCharge">
					<el-input v-model="addForm.deptInCharge"></el-input>
				</el-form-item>
				<el-form-item label="规章类别" prop="ruleType">
					<el-select v-model="addForm.ruleType" filterable clearable>
						<el-option v-for="item in rulesList" :label="item.dicName" :value="item.dicCode" :key="item.dicCode"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="专业" v-if="orgInfo.unitLevel != 'DIC-004'">
					<el-select v-model="addForm.ruleDomain" filterable clearable>
						<el-option v-for="item in majorList" :label="item.dicName" :value="item.dicCode" :key="item.dicCode"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="发文时间" prop="ruleIssueDate">
					<el-date-picker value-format="yyyy-MM-dd" type="date" placeholder="选择日期" v-model="addForm.ruleIssueDate" style="width: 100%;"></el-date-picker>
				</el-form-item>
				<el-form-item label="施行时间" prop="ruleImplDate">
					<el-date-picker value-format="yyyy-MM-dd" type="date" placeholder="选择日期" v-model="addForm.ruleImplDate" style="width: 100%;"></el-date-picker>
				</el-form-item>
			</el-form>
		</popup>
	</div>
</template>

<script>
	import popup from '../components/popup.vue';
	import orgTree from '../components/orgTree.vue';
	export default {
		name: 'titleOverview',
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
					ruleTitle: '',
					ruleNoCode: '',
					ruleNoDomain: '',
					ruleNoSn: '',
					ruleNoRev: '',
					ruleNoYear: '',
					ruleDocNo1: '',
					ruleDocNo2: '',
					ruleDocNo3: '',
					ruleDocNo: '',
					ruleNo: '',
					deptInCharge: '',
					ruleType: '',
					ruleDomain: '',
					ruleIssueDate: '',
					ruleImplDate: ''
				},
				rules: {
					ruleTitle: [{
						required: true,
						message: '请输入规章标题',
						trigger: 'blur'
					},{ min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur' }],
					ruleDocNo: [{
						required: true,
						message: '请输入规章文号',
						trigger: 'blur'
					},{ min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }],
					ruleNo: [{
						required: true,
						message: '请输入规章文号',
						trigger: 'blur'
					},{ min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }],
					deptInCharge: [{
						required: true,
						message: '请输入负责部门',
						trigger: 'blur'
					}],
					ruleIssueDate: [{
						required: true,
						message: '请输入发文时间',
						trigger: 'blur'
					}],
					ruleImplDate: [{
						required: true,
						message: '请输入施行时间',
						trigger: 'blur'
					}],
					ruleType: [{
						required: true,
						message: '请选择规章类别',
						trigger: 'change'
					}],
				},
				popupLoading: false,  //弹窗loading
				queryForm: {  //查询表单
					ruleTitle: '',					ruleDocNo: '',					ruleNo: '',					ruleDomain: '',
					pubTime: [],
					ruleImplDateStart: '',
					ruleImplDateEnd: '',
					ruleExpStatus: '',
					ruleFileStatus: ''
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
				majorList: [],   //专业
				rulesList: [],   //规章类别
				ruleStatusList: [],  //规章状态集合
				userInfo: {},  //用户信息
				orgInfo: {},  //组织机构信息
				currentNode: '',  //当前树节点Id
				ruleFileStatusList: [{   //有无规章文件状态
					label: '有',
					value: 1
				},{
					label: '无',
					value: 0
				}]
			}
		},
		created() {},
		mounted() {
			this.userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
			this.getMajorList();
			this.getRulesType();
			this.getRuleStatus();
			if(this.userInfo.unitId){
				this.getOrgInfo();
			}
		},
		methods: {
			//初始化数据
			init() {
				if(!this.currentNode){
					this.$message.error('请先在左侧选择技术规章分类数据');
					return;
				}
				if(this.currentNode.children.length > 0){
					this.$message.error('请先在左侧选择最子级技术规章分类数据');
					return;
				}
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
							this.majorList.forEach(items => {
								if(item.ruleDomain == items.dicCode){
									item.ruleDomainName = items.dicName;
								}
							})
							this.ruleStatusList.forEach(items => {
								if(item.ruleExpStatus == items.dicCode){
									item.ruleExpStatusName = items.dicName;
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
			//树节点点击触发事件
			clickHandler(nodeData){
				this.currentNode = nodeData;
				if(this.currentNode.children.length > 0){
					return;
				}
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
			//添加数据
			saveData(){
				this.$refs['addForm'].validate((valid) => {
					if (valid) {
						if(this.orgInfo.unitLevel != 'DIC-004' && (!this.addForm.ruleDocNo1 || !this.addForm.ruleDocNo2 || !this.addForm.ruleDocNo3)){
							this.$message.warning('请输入正确的规章文号');
							return;
						}
						if(this.orgInfo.unitLevel != 'DIC-004' && (!this.addForm.ruleNoCode || !this.addForm.ruleNoSn || !this.addForm.ruleNoYear)){
							this.$message.warning('请输入正确的规章编号');
							return;
						}
						let validateNum = /^[0-9a-zA-Z\-]*$/;
						let validateNumber = /^[0-9]*$/;
						if(this.orgInfo.unitLevel != 'DIC-004' && (!validateNum.test(this.addForm.ruleNoCode) || !validateNumber.test(this.addForm.ruleNoSn) || !validateNum.test(this.addForm.ruleNoRev) || !validateNum.test(this.addForm.ruleNoYear))){
							this.$message.warning('请输入正确的规章编号');
							return;
						}
						if(this.orgInfo.unitLevel == 'DIC-004' && !validateNum.test(this.addForm.ruleNo)){
							this.$message.warning('请输入正确的规章编号');
							return;
						}
						this.popupLoading = true;
						if(!this.editId){
							let data = {...this.addForm};
							data.ownClassId = this.currentNode.classId;
							if(this.userInfo.unitId){
								data.ownUnitId = this.userInfo.unitId;
								data.unitLevel = this.orgInfo.unitLevel;
							}
							if(this.orgInfo.unitLevel != 'DIC-004'){
								data.ruleDocNo = data.ruleDocNo1 + '〔' + data.ruleDocNo2 + '〕'  + data.ruleDocNo3 + '号';
								delete data.ruleDocNo1;
								delete data.ruleDocNo2;
								delete data.ruleDocNo3;
							}
							this.$http.post('/rule/prop/insertProp', data).then(res =>{
								if(res.code == '1'){
									this.popupLoading = false;
									this.showPopup = false;
									this.$message.success('添加成功！');
									this.resizeForm();
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
							let data = JSON.parse(JSON.stringify(this.addForm));
							data.ruleId = this.editId;
							this.$http.post('/rule/prop/updateProp', data).then(res =>{
								if(res.code == '1'){
									this.popupLoading = false;
									this.showPopup = false;
									this.$message.success('修改成功！');
									this.resizeForm();
									this.init();
								}else{
									this.popupLoading = false;
									this.$message.error(res.msg);
								}
							}).catch(err => {
								this.popupLoading = false;
								console.log(err);
							})
						}
					}else{
						this.$message.warning('请确认必填项是否填写完整!');
					}
				});
			},
			//查看规章文件详情
			lookRuleDetail(id){
				this.$router.push({path: '/titleMaintenance/ruleFileDetail', query: {
					id: id
				}});
			},
			//重置添加内容
			resizeForm(){
				Object.keys(this.addForm).forEach(key => {
					this.addForm[key] = null;
				})
			},
			//重置查询条件
			resizeQueryForm(){
				Object.keys(this.queryForm).forEach(key => {
					this.queryForm[key] = null;
					if(key == 'pubTime'){
						this.queryForm[key] = [];
					}
				})
			},
			//编辑数据
			editData(row){
				this.editId = row.ruleId;
				this.popupTitle = '修改';
				this.showPopup = true;
				Object.keys(this.addForm).forEach(key => {
					this.addForm[key] = row[key];
				})
				if(this.orgInfo.unitLevel != 'DIC-004'){
					let str = row.ruleDocNo;
					this.addForm.ruleDocNo1 = str.split('〔')[0];
					str = str.split('〔')[1];
					this.addForm.ruleDocNo2 =str.split('〕')[0];
					str = str.split('〕')[1];
					this.addForm.ruleDocNo3 =str.split('号')[0];
					delete this.addForm.ruleNo;
				}
			},
			//删除数据
			deleteData(row){
				this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					let data = new FormData();
					data.append('ruleId', row.ruleId);
					this.$http.post('/rule/prop/deleteProp',data, {
						headers: {
							"Content-Type": "application/x-www-form-urlencoded"
						}
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
			},
			//获取专业list
			getMajorList(){
				let data = new FormData();
				data.append('dicType', 3);
				this.$http.post('/rule/dataDic/getDataDicByType', data, {
					headers: {
						"Content-Type": "application/x-www-form-urlencoded"
					}
				}).then(res => {
					if(res.code == '1'){
						this.majorList = res.data;
					}else{
						this.$message.error(msg);
					}
				}).catch(err => {
					console.log(err);
				})
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