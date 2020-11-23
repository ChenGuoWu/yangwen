<template>
	<div class="organization">
		<div class="one_level" v-if="pageType=='1'">
			<div class="header">
				<button class="add_btn" @click="addData(0, 0)">添加</button>
				<!-- <button class="del_btn">删除</button> -->
			</div>
			<div class="table_content" v-loading="loading">
				<div class="table_box">
					<el-table height="100%" :header-cell-style="{background:'#E1E8F4',color:'#333333',fontWeight:'bold'}" :data="tableData" :cell-style="{padding: '0'}" :row-style="{height: '0.4rem'}" style="width: 100%; margin-bottom: 0.4rem;">
						<el-table-column align="center" type="index" label="序号" width="280">
						</el-table-column>
						<el-table-column prop="unitName" label="一级组织机构名称" width="500">
						</el-table-column>
						<el-table-column prop="unitCode" label="机构编码">
						</el-table-column>
						<el-table-column align="center" label="操作" width="160">
							<template slot-scope="scope">
								<el-button style="padding: 0 0.2rem;" @click="editData(scope.row)" type="text" size="small">编辑</el-button>
								<el-button style="color: #FF3D3D; padding: 0 0.2rem;" @click="deleteData(scope.row)" type="text" size="small">删除</el-button>
							</template>
						</el-table-column>
					</el-table>
				</div>
				<el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="page"
				 :page-sizes="pageSizes" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
				</el-pagination>
			</div>
		</div>
		<div class="more_level" v-if="pageType=='2'">
			<div class="table_content">
				<el-table
				    :data="tableData"
				    style="width: 100%"
				    row-key="id"
					ref="tableDom"
					lazy
					:load="loadTreeData"
					:header-cell-style="{background:'#E1E8F4',color:'#333333',fontWeight:'bold'}"
					height="685"
				    :tree-props="{children: 'childDept', hasChildren: 'hasChildren'}">
				    <el-table-column
					  :show-overflow-tooltip="true"
				      prop="unitName"
				      label="组织机构名称"
				      min-width="80%">
				    </el-table-column>
				    <el-table-column align="center" label="操作" min-width="20%">
				    	<template slot-scope="scope">
				    		<el-button v-if="scope.row.parentId == 0 && scope.row.id.indexOf('aaaaaaa') == '-1'" @click="addData(scope.row.id, scope.row.hierarchyLevel)" class="btn" type="text" size="small">添加</el-button>
				    		<el-button v-if="scope.row.parentId != 0 && scope.row.id.indexOf('aaaaaaa') == '-1'" class="btn" @click="editData(scope.row)" type="text" size="small">编辑</el-button>
							<el-button v-if="scope.row.parentId != 0 && scope.row.id.indexOf('aaaaaaa') == '-1'" class="del_btn" @click="deleteData(scope.row)" type="text" size="small">删除</el-button>
							<el-button v-if="scope.row.parentId != 0 && scope.row.id.indexOf('aaaaaaa') == '-1'" class="btn" @click="" type="text" size="small">排序</el-button>
				    	</template>
				    </el-table-column>
				  </el-table>
			</div>
		</div>
		<popup v-loading="popupLoading" v-if="showPopup" @confim="saveData" @cancel="showPopup = false;resizeForm()" :show='showPopup' :title="popupTitle">
			<el-form style="margin:0.2rem 0.2rem 0px 0px;" ref="addForm" :rules="rules" :model="addForm" label-width="120px">
				<el-form-item prop="unitName" label="组织机构名称">
					<el-input v-model="addForm.unitName"></el-input>
				</el-form-item>
				<el-form-item v-if="pageType == '1'" prop="unitCode" label="组织机构编码">
					<el-input v-model="addForm.unitCode"></el-input>
				</el-form-item>
				<el-form-item prop="unitLevel" label="所属层级">
					<el-select v-model="addForm.unitLevel" clearable>
						<el-option v-for="(item, index) in unitLevelList" :label="item.dicName" :value="item.dicCode" :key="item.dicCode"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item v-if="addForm.unitLevel == 'DIC-004' && pageType == '2'" prop="stationsType" label="站段分类">
					<el-select v-model="addForm.stationsType" filterable clearable>
						<el-option v-for="(item, index) in depotClassifyList" :label="item.dicName" :value="item.dicCode" :key="item.dicCode"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="失效审核" style="text-align: left;"  v-if="pageType == '1'">
					<el-radio-group v-model="addForm.loseCheck">
						<el-radio :label="0">否</el-radio>
						<el-radio :label="1">是</el-radio>
					</el-radio-group>
				</el-form-item>
			</el-form>
		</popup>
	</div>
</template>

<script>
	import popup from '../components/popup.vue';
	export default {
		name: 'organization',
		components: {
			popup
		},
		data() {
			var validUniCode = (rule, value, callback) => {
				if (!value) {
					return callback(new Error('组织机构编码不能为空'));
				}
				setTimeout(() => {
					let reg = /^[0-9a-zA-Z]*$/g;
					if (!reg.test(value)) {
						callback(new Error('请输入正确格式的机构编码（数字、字母或字母数字组合）'));
					} else {
						callback();
					}
				}, 300);
			};
			return {
				tableData: [], //表格数据
				pageType: '', //显示一级组织机构还是多级组织机构  1:一级  2:多级
				loading: false, //是否显示loading
				pageSizes: [10, 15, 20, 25, 30], //可选择显示条数
				pageSize: 10, //每页显示条数，默认为10
				page: 1, //当前页数，默认为1
				total: 0, //数据总条数
				showPopup: false, //是否打开弹窗
				popupTitle: '添加组织机构', //弹窗标题
				addForm: {
					unitName: '',
					unitLevel: '',
					unitCode: null,
					loseCheck: 1,
					stationsType: null
				},
				rules: {
					unitName: [{
						required: true,
						message: '请输入组织机构名称',
						trigger: 'blur'
					}],
					unitLevel: [{
						required: true,
						message: '请选择所属层级',
						trigger: 'change'
					}],
					unitCode: [{
						required: true,
						validator: validUniCode,
						trigger: 'blur'
					}],
					stationsType: [{
						required: true,
						message: '请选择站段分类',
						trigger: 'change'
					}],
				},
				popupLoading: false,  //弹窗loading
				editId: '', //修改数据id
				unitLevelList: [],  //组织机构所属层级
				depotClassifyList: [],  //站段分类
				parentId: '',  //父级id
				currentTreeNoteId: '',  //当前树节点
				hierarchyLevel: '',  //当前等级
			}
		},
		created() {
			this.pageType = this.$route.query.pageType;
			this.getLevel();
			this.init();
			if(this.pageType == '2'){
				this.rules['unitName'][1] = { min: 1, max: 15, message: '长度在 1 到 15 个字符', trigger: 'blur' };
				this.getDepotClassify();
			}else{
				this.rules['unitName'][1] = { min: 1, max: 30, message: '长度在 1 到 15 个字符', trigger: 'blur' };
			}
		},
		methods: {
			//初始化数据
			init() {
				this.loading = true;
				let requestUrl = '/rule/unit/getRuleUnitListByParentId',
					data = {
						id: 0
					};
				if (this.pageType == '1') {
					data.pageIndex = this.page;
					data.pageSize = this.pageSize;
				}
				this.$http.post(requestUrl, data).then(res => {
					this.loading = false;
					if (res.code == '1') {
						this.tableData = res.data;
						if (this.pageType == '1') this.total = res.pageInfo.total;
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
			//获取站段分类列表
			getDepotClassify(){
				let data = new FormData();
				data.append('dicType', 6);
				this.$http.post('/rule/dataDic/getDataDicByType', data, {
					headers: {
						"Content-Type": "application/x-www-form-urlencoded"
					}
				}).then(res => {
					if(res.code == '1'){
						this.depotClassifyList = res.data;
					}
				}).catch(err => {
					console.log(err);
				})
			},
			//获取所属等级字典
			getLevel(){
				let data = new FormData();
				data.append('dicType', 1);
				this.$http.post('/rule/dataDic/getDataDicByType', data, {
					headers: {
						"Content-Type": "application/x-www-form-urlencoded"
					}
				}).then(res => {
					if(res.code == '1'){
						if(this.pageType == '1') this.unitLevelList = res.data.filter(item => {
							return item.dicCode == 'DIC-001' || item.dicCode == 'DIC-002';
						});
						if(this.pageType == '2') this.unitLevelList = res.data.filter(item => {
							return item.dicCode == 'DIC-003' || item.dicCode == 'DIC-004';
						});
					}
				}).catch(err => {
					console.log(err);
				})
			},
			//懒加载tree数据
			loadTreeData(tree, treeNode, resolve){
				if(tree.id.indexOf('aaaaaaa') == -1){
					this.$http.post('/rule/unit/getRuleUnitListByParentId', {id: tree.id}).then(res => {
						if(res.code == '1'){
							if(res.dataTwo && res.dataTwo.length > 0){
								let obj = {
									id: new Date().getTime() + 'aaaaaaa' + Math.floor(Math.random()*(1 - 100) + 100),
									unitName : '站段',
									hasChildren: true,
									children: res.dataTwo
								}
								res.data.push(obj);
							}
							resolve(res.data);
						}else{
							this.$message.error(res.msg);
						}
					}).catch(err => {
						console.log(err);
					})
				}else{
					resolve(tree.children, 500);
				}
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
			addData(id, hierarchyLevel){
				this.popupTitle = '添加组织机构';
				this.parentId = id;
				if(this.pageType == '2') this.currentTreeNoteId = id;
				this.editId = '';
				this.showPopup = true;
			},
			//添加数据
			saveData(){
				this.$refs['addForm'].validate((valid) => {
					if (valid) {
						this.popupLoading = true;
						if(!this.editId){
							let data = {...this.addForm};
							data.parentId = this.parentId;
							this.$http.post('/rule/unit/insertRuleUnit', data).then(res =>{
								if(res.code == '1'){
									this.popupLoading = false;
									this.showPopup = false;
									this.$message.success('添加成功！');
									if(this.pageType == '2') this.handlerTreeData('add', res.data.id);
									this.resizeForm();
									if(this.pageType == '1') this.init();
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
							data.parentId = this.parentId;
							if(this.pageType == '1') data.parentId = 0;
							this.$http.post('/rule/unit/updateByUnitId', data).then(res =>{
								if(res.code == '1'){
									this.popupLoading = false;
									this.showPopup = false;
									this.$message.success('修改成功！');
									if(this.pageType == '2') this.handlerTreeData('edit');
									this.resizeForm();
									if(this.pageType == '1') this.init();
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
			//处理tree数据
			handlerTreeData(type, id){
				if(type == 'add'){
					this.tableData.forEach(item => {
						if(item.id == this.currentTreeNoteId){
							item.hasChildren = true;
						}
					})
				}
				let allLazyList = this.$refs.tableDom.store.states.lazyTreeNodeMap;
				if(type == 'add'){
					Object.keys(allLazyList).forEach(key => {
						if(key == this.currentTreeNoteId){
							allLazyList[key].push({
								id: id,
								unitName: this.addForm.unitName,
								loseCheck: this.addForm.loseCheck,
								unitLevel: this.addForm.unitLevel,
								stationsType: this.addForm.stationsType
							})
						}
					})
				}else{
					Object.values(allLazyList).forEach(item => {
						item.forEach(items => {
							if(items.id == this.editId){
								items.unitName = this.addForm.unitName;
								items.loseCheck = this.addForm.loseCheck;
								items.unitLevel = this.addForm.unitLevel;
								items.stationsType = this.addForm.stationsType;
							}
						})
					})
				}
			},
			//重置添加内容
			resizeForm(){
				Object.keys(this.addForm).forEach(key => {
					this.addForm[key] = null;
					if(key == 'loseCheck'){
						this.addForm[key] = 1;
					}
				})
			},
			//编辑数据
			editData(row){
				this.editId = row.id;
				this.parentId = row.parentId;
				this.popupTitle = '修改组织机构';
				this.showPopup = true;
				Object.keys(this.addForm).forEach(key => {
					this.addForm[key] = row[key];
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
					this.$http.post('/rule/unit/deleteRuleUnitById', data).then(res => {
						if(res.code == '1'){
							this.$message({
								type: 'success',
								message: '删除成功!'
							});
							if(this.pageType == '2'){
								let parentRow =  this.$refs.tableDom.store.states.data.find(child => child.id == row.parentId);
								let allLazyList = this.$refs.tableDom.store.states.lazyTreeNodeMap;
								allLazyList[row.parentId].forEach((item, index) => {
									if(item.id == row.id) allLazyList[row.parentId].splice(index, 1);
								})
								if(!parentRow.children){
									parentRow.hasChildren = false;
								}
							}
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
