<template>
	<div class="organization">
		<div class="one_level">
			<div class="header">
				<div class="query_info">
					<div class="query_item">
						<el-input placeholder="请输入查询内容" v-model="queryForm.term" class="search_query"></el-input>
					</div>
					<div class="query_item">
						<span>单位</span>
						<el-select clearable @change="getUnitList" :disabled="disabledQuery" placeholder="请选择查询单位" class="search_query width_2rem" v-model="queryForm.workUnits">
							<el-option v-for="item in unitList" :key="item.id" :label="item.unitName" :value="item.id"></el-option>
						</el-select>
					</div>
					<div class="query_item">
						<span>部门</span>
						<el-select placeholder="请选择查询部门" class="search_query width_2rem" v-model="queryForm.subordinateDepartments">
							<el-option v-for="item in unitChildList" :key="item.id" :label="item.unitName" :value="item.id"></el-option>
						</el-select>
					</div>
				</div>
				<button class="search_btn" @click="init">查询</button>
				<button class="search_btn" @click="resizeQuery">重置</button>
				<button class="search_btn">批量导入</button>
				<button class="search_btn">下载模板</button>
				<button class="del_btn" @click="deleteMore">删除</button>
				<button class="add_btn" @click="addData">添加</button>
			</div>
			<div class="table_content" v-loading="loading">
				<div class="table_box">
					<el-table height="100%" @selection-change="handleSelectionChange" :header-cell-style="{background:'#E1E8F4',color:'#333333',fontWeight:'bold'}" :data="tableData" :cell-style="{padding: '0'}" :row-style="{height: '0.4rem'}" style="width: 100%; margin-bottom: 0.4rem;">
						<el-table-column
							align="center"
						   type="selection"
						   width="55">
						 </el-table-column>
						<el-table-column align="center" type="index" label="序号" width="60">
						</el-table-column>
						<el-table-column prop="userAccount" label="用户登录名" width="160">
						</el-table-column>
						<el-table-column prop="userName" label="姓名"  width="140">
						</el-table-column>
						<el-table-column prop="userBirthday" label="出生年月" width="120">
						</el-table-column>
						<el-table-column prop="userGender" label="性别" width="60">
							<template slot-scope="scope">
								<span>{{scope.row.userGender === '1' ? '男' : scope.row.userGender === '0' ? '女' : ''}}</span>
							</template>
						</el-table-column>
						<el-table-column prop="userCell" label="手机号" width="120">
						</el-table-column>
						<el-table-column prop="userPhone" label="座机号" width="120">
						</el-table-column>
						<el-table-column prop="workUnits" label="单位" width="180">
						</el-table-column>
						<el-table-column prop="subordinateDepartments" label="部门" width="120">
						</el-table-column>
						<el-table-column align="center" prop="userAccountStatus" label="状态" width="60">
							<template slot-scope="scope">
								<span :style="{color: scope.row.userAccountStatus == 1 ? '#409EFF' : '#F48725'}">{{scope.row.userAccountStatus == 1 ? '启用' : '禁用'}}</span>
							</template>
						</el-table-column>
						<el-table-column align="center" label="操作" fixed="right">
							<template slot-scope="scope">
								<el-button :style="{color: scope.row.userAccountStatus == 1 ? '#F48725' : '#409EFF', padding: '0 0.06rem'}" @click="changeStatus(scope.row)" type="text" size="small">{{scope.row.userAccountStatus == 1 ? '禁用' : '启用'}}</el-button>
								<el-button style="padding: 0.06rem;" @click="" type="text" size="small">重置密码</el-button>
								<el-button style="padding: 0.06rem;" @click="editData(scope.row)" type="text" size="small">编辑</el-button>
								<el-button style="padding: 0.06rem;" @click="viewData(scope.row)" type="text" size="small">查看</el-button>
								<el-button style="color: #FF3D3D; padding: 0.06rem;" @click="deleteData(scope.row)" type="text" size="small">删除</el-button>
							</template>
						</el-table-column>
					</el-table>
				</div>
				<el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="page"
				 :page-sizes="pageSizes" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
				</el-pagination>
			</div>
		</div>
		<popup v-loading="popupLoading" :overflow="true" :popupHeight="'6.63'" v-if="showPopup" @confim="saveData" @cancel="showPopup = false;resizeForm()" :show='showPopup' :title="popupTitle">
			<el-form style="margin:0.2rem 0.2rem 0px 0px;" ref="addForm" :rules="rules" :model="addForm" label-width="90px">
				<el-form-item prop="userAccount" label="用户名">
					<el-input :disabled="isView" @input="inputHandler" v-model="addForm.userAccount"></el-input>
				</el-form-item>
				<el-form-item prop="userName" label="姓名">
					<el-input :disabled="isView" v-model="addForm.userName"></el-input>
				</el-form-item>
				<el-form-item label="出生年月">
					<el-date-picker value-format="yyyy-MM-dd" :disabled="isView" type="date" placeholder="选择日期" v-model="addForm.userBirthday" style="width: 100%;"></el-date-picker>
				</el-form-item>
				<el-form-item label="性别">
					<el-select :disabled="isView" v-model="addForm.userGender">
						<el-option v-for="item in sexList" :key="item.value" :label="item.label" :value="item.value"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item prop="userCell" label="手机号">
					<el-input :disabled="isView" v-model="addForm.userCell"></el-input>
				</el-form-item>
				<el-form-item label="邮箱">
					<el-input :disabled="isView" v-model="addForm.userEmail"></el-input>
				</el-form-item>
				<el-form-item label="座机">
					<el-input :disabled="isView" v-model="addForm.userPhone"></el-input>
				</el-form-item>
				<el-form-item label="身份证号">
					<el-input :disabled="isView" v-model="addForm.idCard"></el-input>
				</el-form-item>
				<el-form-item label="职称">
					<el-input :disabled="isView" v-model="addForm.userProfTitle"></el-input>
				</el-form-item>
				<el-form-item label="职务">
					<el-input :disabled="isView" v-model="addForm.userTitle"></el-input>
				</el-form-item>
				<el-form-item label="工种">
					<el-input :disabled="isView" v-model="addForm.userWorkType"></el-input>
				</el-form-item>
				<el-form-item prop="workUnits" label="单位">
					<el-select :disabled="isView || disabledQuery" @change="getUnitList" v-model="addForm.workUnits">
						<el-option v-for="item in unitList" :key="item.id" :label="item.unitName" :value="item.id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item prop="subordinateDepartments" label="部门">
					<el-select :disabled="isView" v-model="addForm.subordinateDepartments">
						<el-option v-for="item in addUnitChildList" :key="item.id" :label="item.unitName" :value="item.id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="状态">
					<el-select :disabled="isView" v-model="addForm.userAccountStatus">
						<el-option v-for="item in userAccountStatusList" :key="item.value" :label="item.label" :value="item.value"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item prop="userRole" label="用户角色">
					<el-select :disabled="isView" v-model="addForm.userRole">
						<el-option v-for="item in userRoleList" :key="item.id" :label="item.roleName" :value="item.id"></el-option>
					</el-select>
				</el-form-item>
			</el-form>
		</popup>
	</div>
</template>

<script>
	import popup from '../components/popup.vue';
	export default {
		name: 'userManage',
		components: {
			popup
		},
		data() {
			var validUserAccount = (rule, value, callback) => {
				if (!value) {
					return callback(new Error('请输入用户名'));
				}
				setTimeout(() => {
					let reg = /^[0-9a-zA-Z]*$/g;
					if (!reg.test(value)) {
						callback(new Error('请输入正确格式的用户名（数字、字母或字母数字组合）'));
					} else {
						callback();
					}
				}, 300);
			};
			var validUserCell = (rule, value, callback) => {
				if (!value) {
					return callback(new Error('请输入手机号'));
				}
				setTimeout(() => {
					let reg = /^1[3456789]\d{9}$/g;
					if (!reg.test(value)) {
						callback(new Error('请输入正确格式的手机号'));
					} else {
						callback();
					}
				}, 300);
			};
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
					userAccount: '',
					userName: '',
					userBirthday: '',
					userGender: '',
					userCell: '',
					userEmail: '',
					userPhone: '',
					idCard: '',
					userProfTitle: '',
					userTitle: '',
					userWorkType: '',
					workUnits: '',
					subordinateDepartments: '',
					userAccountStatus: 1,
					userRole: ''
				},
				rules: {
					userAccount: [{
						required: true,
						validator: validUserAccount,
						trigger: 'blur'
					}],
					userName: [{
						required: true,
						message: '请输入姓名',
						trigger: 'blur'
					}],
					userCell: [{
						required: true,
						validator: validUserCell,
						trigger: 'blur'
					}],
					workUnits: [{
						required: true,
						message: '请选择单位',
						trigger: 'change'
					}],
					subordinateDepartments: [{
						required: true,
						message: '请选择部门',
						trigger: 'change'
					}],
					userRole: [{
						required: true,
						message: '请选择用户角色',
						trigger: 'change'
					}],
				},
				sexList: [{  //性别数据
					value: '0',
					label: '女'
				},{
					value: '1',
					label: '男'
				}],
				userRoleList:[],  //用户角色list
				unitList:[],  //单位集合
				unitChildList:[],  //部门集合
				addUnitChildList:[],  //弹窗部门集合
				userAccountStatusList:  [{  //状态数据
					value: 0,
					label: '禁用'
				},{
					value: 1,
					label: '启用'
				}],
				userInfo: {},  //用户信息
				popupLoading: false,  //弹窗loading
				queryForm: {  //查询表单
					term: '',
					workUnits: '',
					subordinateDepartments: ''
				},
				editId: '', //修改数据id
				defaultProps: {
				  children: 'children',
				  label: 'name'
				},
				disabledQuery: false,  //在不是超级管理员时默认为当前人员单位（查询单位禁用）
				isView: false,  //是否是查看详情
				multipleTable: [],  //表格多选数据
			}
		},
		created() {
			this.init();
			this.getUnitList(0);
		},
		mounted() {
			this.getRoleList();
			this.userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
			if(this.userInfo.userRole != 1){
				this.queryForm.workUnits = this.userInfo.workUnits;
				this.disabledQuery = true;
				this.getUnitList(this.userInfo.workUnits);
			}
		},
		methods: {
			//初始化数据
			init() {
				this.loading = true;
				let data = {
						...this.queryForm,
						pageIndex: this.page,
						pageSize: this.pageSize
					};
				this.$http.post('/rule/users/getUserByCondition', data).then(res => {
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
			//创建用户名只能为字母数字实时校验
			inputHandler(){
				let reg = /^[0-9a-zA-Z]*$/g;
				if (!reg.test(this.addForm.userAccount)) {
					let regs = /[\u4e00-\u9fa5]/g;
					this.addForm.userAccount = this.addForm.userAccount.replace(regs, "");
				} else {
					this.addForm.userAccount = this.addForm.userAccount.toLowerCase();
				}
			},
			//获取用户角色列表
			getRoleList(){
				this.$http.get('/rule/role/getRuleRoleList').then(res => {
					if(res.code == '1'){
						this.userRoleList = res.data.filter(item => {
							return item.id != 1;
						})
					}
				}).catch(err => {
					console.log(err);
				})
			},
			//修改用户状态
			changeStatus(row){
				let data = {
					id: row.id,
					userAccountStatus: row.userAccountStatus == 1 ? 0 : 1
				};
				this.$confirm(`是否要${row.userAccountStatus == 1 ? '禁用' : '启用'}改用户?`, '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					this.$http.post('/rule/users/changeUserState', data).then(res =>{
						if(res.code == 1){
							row.userAccountStatus = row.userAccountStatus == 1 ? 0 : 1;
							this.$message.success('操作成功');
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
			//表格多选
			 handleSelectionChange(val) {
				this.multipleTable = val;
			},
			//获取组织机构列表
			getUnitList(id){
				if(id === ''){
					this.queryForm.subordinateDepartments = '';
					this.unitChildList = [];
					return;
				};
				this.showPopup ? this.addForm.subordinateDepartments = '' : this.queryForm.subordinateDepartments = '';
				let requestUrl = '/rule/unit/getRuleUnitListByParentId',
					data = {
						id: id
					};
				this.$http.post(requestUrl, data).then(res => {
					if (res.code == '1') {
						if(id === 0){
							this.unitList = res.data;
						}else{
							if(res.dataTwo){
								this.showPopup ? this.addUnitChildList = [...res.data, ...res.dataTwo] : this.unitChildList = [...res.data, ...res.dataTwo];
							}else{
								this.showPopup ? this.addUnitChildList = [...res.data] : this.unitChildList = [...res.data];
							}
						}
					} else {
						this.$message.error(res.msg);
					}
				}).catch(err => {
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
			//打开弹窗
			addData(){
				this.isView = false;
				this.popupTitle = '添加';
				this.editId = '';
				this.addForm.workUnits = this.userInfo.workUnits;
				this.getUnitList(this.userInfo.workUnits);
				this.showPopup = true;
			},
			//添加数据
			saveData(){
				if(this.isView){
					this.showPopup = false;
					return;
				}
				this.$refs['addForm'].validate((valid) => {
					if(valid){
						this.popupLoading = true;
					    if(!this.editId){
					    	let data = {...this.addForm};
					    	this.$http.post('/rule/users/addUser', data).then(res =>{
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
					    	data.id = this.editId;
					    	this.$http.post('/rule/users/updataUser', data).then(res =>{
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
			//重置添加内容
			resizeForm(){
				Object.keys(this.addForm).forEach(key => {
					this.addForm[key] = null;
				})
			},
			//重置查询条件
			resizeQuery(){
				Object.keys(this.queryForm).forEach(key => {
					if(this.userInfo.userRole != 0 && key != 'unitId'){
						this.queryForm[key] = '';
					}
				})
			},
			//查看详情
			viewData(row){
				this.isView = true;
				this.popupTitle = '详情';
				this.showPopup = true;
				this.getUnitList(row.workUnitsId);
				Object.keys(this.addForm).forEach(key => {
					this.addForm[key] = row[key];
				})
			},
			//编辑数据
			async editData(row){
				this.isView = false;
				this.editId = row.id;
				this.popupTitle = '修改';
				this.showPopup = true;
				await this.getUnitList(row.workUnitsId);
				Object.keys(this.addForm).forEach(key => {
					this.addForm[key] = row[key];
				})
				this.$nextTick(() => {
					this.addForm.subordinateDepartments = row.subordinateDepartmentsId;
					this.addForm.workUnits = row.workUnitsId;
				})
			},
			//删除数据
			deleteData(row){
				this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					let data = {
						id: row.id
					};
					this.$http.post('/rule/user/deleteUserById', data).then(res => {
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
			//批量删除
			deleteMore(){
				if(this.multipleTable.length <= 0){
					this.$message.warning('请先选择表格内数据!');
					return;
				}
				this.$confirm('此操作将永久删除选中数据, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					let arr = this.multipleTable.map(item => {
						return item.id;
					});
					let data = new FormData();
					data.append('ruleUserIdStr', arr.join(','));
					this.$http.post('/rule/user/deleteUserByIdBatch', data, {
						headers: {
							"Content-Type": "application/x-www-form-urlencoded"
						}
					}).then(res => {
						if(res.code == '1'){
							this.$message({
								type: 'success',
								message: '删除成功!'
							});
							this.multipleTable = [];
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
				width: 80px;
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
			.del_btn {
				width: 80px;
				height: 32px;
				background: #FFFFFF;
				border: 1px solid #00479D;
				border-radius: 4px;
				font-size: 12px;
				color: #00479D;
				position: absolute;
				right: 110px;
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
</style>
