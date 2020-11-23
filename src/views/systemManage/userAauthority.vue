<template>
	<div class="organization">
		<div class="one_level">
			<div class="header">
				<div class="query_info">
					<div class="query_item">
						<span>角色名称</span>
						<el-input v-model="queryForm.roleName" placeholder="请输入查询名称" class="search_query"></el-input>
					</div>
				</div>
				<button class="search_btn" @click="init">查询</button>
				<button class="add_btn" @click="addData">添加</button>
			</div>
			<div class="table_content" v-loading="loading">
				<div class="table_box">
					<el-table height="100%" :header-cell-style="{background:'#E1E8F4',color:'#333333',fontWeight:'bold'}" :data="tableData" :cell-style="{padding: '0'}" :row-style="{height: '0.4rem'}" style="width: 100%; margin-bottom: 0.4rem;">
						<el-table-column type="index" label="序号" width="280">
						</el-table-column>
						<el-table-column :show-overflow-tooltip="true" prop="roleName" label="名称" width="380">
						</el-table-column>
						<el-table-column prop="note" label="说明">
						</el-table-column>
						<el-table-column align="center" label="操作" width="300">
							<template slot-scope="scope">
								<el-button :disabled="scope.row.id <= 3" style="padding: 0 0.5rem;" @click="editData(scope.row)" type="text" size="small">编辑</el-button>
								<el-button :disabled="scope.row.id <= 3" :style="{color: scope.row.id <= 3 ? '#C0C4CC' : '#FF3D3D', padding: '0 0.5rem'}" @click="deleteData(scope.row)" type="text" size="small">删除</el-button>
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
			<el-form style="margin:0.2rem 0.2rem 0px 0px;" ref="addForm" :rules="rules" :model="addForm" label-width="60px">
				<el-form-item prop="roleName" label="名称">
					<el-input v-model="addForm.roleName"></el-input>
				</el-form-item>
				<el-form-item class="is_required" style="overflow-y: auto; height: 3.8rem;" label="权限">
					<el-tree
					  :data="treeData"
					  ref="tree"
					  default-expand-all
					  show-checkbox
					  :props="defaultProps"
					  node-key="id">
					</el-tree>
				</el-form-item>
				<el-form-item label="说明">
					<el-input type="textarea" v-model="addForm.note"></el-input>
				</el-form-item>
			</el-form>
		</popup>
	</div>
</template>

<script>
	import popup from '../components/popup.vue';
	export default {
		name: 'userAauthority',
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
				addForm: {
					"roleName" : "",
					"ruleArray" : [],
					"note" : ""
				},
				rules: {
					roleName: [{
						required: true,
						message: '请输入角色名称',
						trigger: 'blur'
					}]
				},
				popupLoading: false,  //弹窗loading
				queryForm: {  //查询表单
					roleName: ''
				},
				editId: '', //修改数据id
				treeData: [],  //tree数据
				defaultProps: {
				  children: 'children',
				  label: 'name'
				}
			}
		},
		created() {
			this.init();
		},
		mounted() {
			this.getTreeData();
		},
		methods: {
			//初始化数据
			init() {
				this.loading = true;
				let requestUrl = '/rule/role/getRoleLikeName',
					data = new FormData();
				data.append('roleName', this.queryForm.roleName);
				data.append('pageIndex', this.page);
				data.append('pageSize', this.pageSize);
				this.$http.post(requestUrl, data, {
					headers:{
						"Content-Type": "application/x-www-form-urlencoded"
					}
				}).then(res => {
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
			//获取tree列表
			getTreeData(){
				this.$http.get('/rule/user/getPermissionTree').then(res => {
					if(res.code == '1'){
						this.treeData = res.data;
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
				this.popupTitle = '添加';
				this.editId = '';
				this.showPopup = true;
			},
			//添加数据
			saveData(){
				if(this.$refs.tree.getCheckedKeys().length == 0){
					this.$message.warning('请选择最少一项权限');
					return
				}
				this.$refs['addForm'].validate((valid) => {
					if (valid) {
						this.popupLoading = true;
						if(!this.editId){
							let data = {...this.addForm};
							data.ruleArray = this.$refs.tree.getCheckedKeys().concat(this.$refs.tree.getHalfCheckedKeys());
							this.$http.post('/rule/role/addRole', data).then(res =>{
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
							data.ruleArray = this.$refs.tree.getCheckedKeys().concat(this.$refs.tree.getHalfCheckedKeys());
							data.id = this.editId;
							this.$http.post('/rule/role/upataRoleByName', data).then(res =>{
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
				this.$refs.tree.setCheckedKeys([]);
			},
			//编辑数据
			editData(row){
				this.editId = row.id;
				let data = new FormData();
				data.append('roleName', row.roleName);
				this.$http.post('/rule/role/getRoleByName', data, {
					headers:{
						"Content-Type": "application/x-www-form-urlencoded"
					}
				}).then(res => {
					if (res.code == '1') {
						this.popupTitle = '修改';
						Object.keys(this.addForm).forEach(key => {
							this.addForm[key] = res.data[key];
						})
						this.showPopup = true;
						this.$nextTick(() => {
							this.$refs.tree.setCheckedKeys(res.data.ruleArray);
						})
					} else {
						this.$message.error(res.msg);
					}
				}).catch(err => {
					console.log(err);
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
					this.$http.post('/rule/role/deleteRuleRoleById', data).then(res => {
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
		}
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
