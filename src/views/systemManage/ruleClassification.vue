<template>
	<div class="rule_classification">
		<div class="one_level" v-if="pageType=='1'">
			<div class="header">
				<button class="add_btn" @click="addData(0, 0, 0)">添加</button>
				<!-- <button class="del_btn">删除</button> -->
			</div>
			<div class="table_content" v-loading="loading">
				<div class="table_box">
					<el-table height="100%" :header-cell-style="{background:'#E1E8F4',color:'#333333',fontWeight:'bold'}" :data="tableData" :cell-style="{padding: '0'}" :row-style="{height: '0.4rem'}" style="width: 100%; margin-bottom: 0.4rem;">
						<el-table-column align="center" type="index" label="序号" width="280">
						</el-table-column>
						<el-table-column :show-overflow-tooltip="true" prop="ruleNodeName" label="一级规章分类" width="550">
						</el-table-column>
						<el-table-column :show-overflow-tooltip="true" prop="unitName" label="所属组织机构" width="500">
						</el-table-column>
						<el-table-column align="center" label="操作">
							<template slot-scope="scope">
								<el-button style="padding: 0 0.15rem;" @click="editData(scope.row)" type="text" size="small">编辑</el-button>
								<el-button style="color: #FF3D3D; padding: 0 0.15rem;" @click="deleteData(scope.row)" type="text" size="small">删除</el-button>
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
				    row-key="classId"
				    lazy
					ref="tableDom"
					:load="loadTreeData"
					:header-cell-style="{background:'#E1E8F4',color:'#333333',fontWeight:'bold'}"
					height="685"
				    :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
				    <el-table-column
				      prop="ruleNodeName"
				      label="规章分类名称"
				      width="1300">
				    </el-table-column>
				    <el-table-column align="center" label="操作">
				    	<template slot-scope="scope">
				    		<el-button v-if="scope.row.hierarchyLevel < 4" @click="addData(scope.row.classId, scope.row.topMostId,  scope.row.hierarchyLevel)" class="btn" type="text" size="small">添加</el-button>
				    		<el-button v-if="scope.row.parentId != 0" class="btn" @click="editData(scope.row)" type="text" size="small">编辑</el-button>
							<el-button v-if="scope.row.parentId != 0" class="del_btn" @click="deleteData(scope.row)" type="text" size="small">删除</el-button>
							<el-button v-if="scope.row.parentId != 0" class="btn" type="text" size="small">排序</el-button>
				    	</template>
				    </el-table-column>
				  </el-table>
			</div>
		</div>
		<popup :popupHeight="'2.7'" v-loading="popupLoading" v-if="showPopup" @confim="saveData" @cancel="showPopup = false;resizeForm()" :show='showPopup' :title="popupTitle">
			<el-form style="margin: 0.2rem 0.2rem 0px 0px;" ref="addForm" :rules="rules" :model="addForm" label-width="120px">
				<el-form-item prop="ruleNodeName" label="规章分类名称">
					<el-input v-model="addForm.ruleNodeName"></el-input>
				</el-form-item>
				<el-form-item prop="unitId" label="所属组织机构">
					<el-select v-model="addForm.unitId" filterable clearable>
						<el-option v-for="(item, index) in organizationList" :label="item.unitName" :value="item.id" :key="item.id"></el-option>
					</el-select>
					<span class="error-tip" v-if="isErrorId">*若显示为id，请修改所属组织机构。</span>
				</el-form-item>
			</el-form>
		</popup>
	</div>
</template>

<script>
	import popup from '../components/popup.vue';
	export default {
		name: 'ruleClassification',
		components: {
			popup
		},
		data() {
			return {
				tableData: [], //表格数据
				pageType: '', //显示一级分类还是多级分类 1:一级  2:多级
				loading: false, //是否显示loading
				pageSizes: [10, 15, 20, 25, 30], //可选择显示条数
				pageSize: 10, //每页显示条数，默认为10
				page: 1, //当前页数，默认为1
				total: 0, //数据总条数
				showPopup: false, //是否打开弹窗
				popupTitle: '添加一级分类', //弹窗标题
				addForm: {
					ruleNodeName: '',
					unitId: ''
				},
				rules: {
					ruleNodeName: [{
						required: true,
						message: '请输入规章分类名称',
						trigger: 'blur'
					}],
					unitId: [{
						required: true,
						message: '请选择所属组织机构',
						trigger: 'change'
					}],
				},
				popupLoading: false,  //弹窗loading
				editId: '', //修改数据id
				organizationList: [],  //添加所属机构list
				parentId: 0,  //添加分类时的父级id
				currentTree: '',  //当前树
				currentTreeNoteId: '',  //当前处理tree节点id
				isErrorId: false, //是否是错误id
				editUnitId: '', //修改当前的组织id
				hierarchyLevel: 0,  //规章分类等级
			}
		},
		created() {
			this.pageType = this.$route.query.pageType;
			this.init();
		},
		methods: {
			//初始化数据
			init() {
				this.loading = true;
				let requestUrl = '/rule/classTree/getRuleClassById',
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
						if (this.pageType == '1'){
							this.total = res.pageInfo.total;
						}
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
			//懒加载tree数据
			loadTreeData(tree, treeNode, resolve){
				this.$http.post('/rule/classTree/getRuleClassById', {id: tree.classId}).then(res => {
					if(res.code == '1'){
						resolve(res.data);
					}else{
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
			addData(id, unitId, hierarchyLevel){
				this.getOrgList(unitId);
				this.popupTitle = '添加规章分类';
				this.hierarchyLevel = hierarchyLevel;
				this.editId = '';
				this.parentId = id;
				if(this.pageType == '2') this.currentTreeNoteId = id;
				this.showPopup = true;
			},
			//获取组织机构数据
			getOrgList(level){
				this.$http.post('/rule/unit/getRuleUnitListByParentId', {id: level}).then(res => {
					if(res.code == '1'){
						this.organizationList = [...res.data];
						if(res.dataTwo && res.dataTwo.length > 0) this.organizationList = [...this.organizationList, ...res.dataTwo];
						if(this.editId){
							let flag = false;
							this.organizationList.forEach(item => {
								if(item.id == this.editUnitId){
									flag = true;
									this.isErrorId = false;
								}
							})
							if(!flag){
								this.isErrorId = true;
							}
						}
					}
				}).catch(err => {
					console.log(err);
				})
			},
			//添加/修改 数据
			saveData(){
				this.$refs['addForm'].validate((valid) => {
					if (valid) {
						this.popupLoading = true;
						if(this.editId == ''){
							let data = new FormData();
							data.append('ruleNodeName', this.addForm.ruleNodeName);
							data.append('unitId', this.addForm.unitId);
							data.append('parentId', this.parentId);
							data.append('hierarchyLevel', this.hierarchyLevel);
							this.$http.post('/rule/classTree/insertRuleClass',data, {headers:{
								"Content-Type": "application/x-www-form-urlencoded"
							}}).then(res =>{
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
							this.$http.post('/rule/classTree/updateRuleClass', data).then(res =>{
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
						if(item.classId == this.currentTreeNoteId){
							item.hasChildren = true;
						}
					})
				}
				let allLazyList = this.$refs.tableDom.store.states.lazyTreeNodeMap;
				if(type == 'add'){
					Object.keys(allLazyList).forEach(key => {
						if(key == this.currentTreeNoteId){
							allLazyList[key].push({
								classId: id,
								ruleNodeName: this.addForm.ruleNodeName,
								unitId: this.addForm.unitId,
								hierarchyLevel: (this.hierarchyLevel + 1)
							})
						}else{
							allLazyList[key].forEach(item => {
								if(item.classId == this.currentTreeNoteId){
									item.hasChildren = true;
								}
							})
						}
					})
				}else{
					Object.values(allLazyList).forEach(item => {
						item.forEach(items => {
							if(items.classId == this.editId){
								items.ruleNodeName = this.addForm.ruleNodeName;
								items.unitId = this.addForm.unitId;
							}
						})
					})
				}
			},
			//重置添加内容
			resizeForm(){
				Object.keys(this.addForm).forEach(key => {
					this.addForm[key] = '';
				})
			},
			//编辑数据
			editData(row){
				this.editId = row.classId;
				this.editUnitId = row.unitId;
				if(this.pageType == '2') this.currentTree = row;
				if(this.pageType == '1'){
					this.getOrgList(0);
				}else{
					this.getOrgList(row.topMostId);
				}
				Object.keys(this.addForm).forEach(key => {
					this.addForm[key] = row[key];
				})
				this.popupTitle = '修改规章分类';
				this.showPopup = true;
			},
			//删除数据
			deleteData(row){
				this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					let data = {
						id: row.classId
					};
					this.$http.post('/rule/classTree/deleteRuleClass', data).then(res => {
						if(res.code == '1'){
							this.$message({
								type: 'success',
								message: '删除成功!'
							});
							if(this.pageType == '2'){
								let parentRow =  this.$refs.tableDom.store.states.data.find(child => child.classId == row.parentId);
								let allLazyList = this.$refs.tableDom.store.states.lazyTreeNodeMap;
								allLazyList[row.parentId].forEach((item, index) => {
									if(item.classId == row.classId) allLazyList[row.parentId].splice(index, 1);
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
	.error-tip{
		color: #F56C6C;
	}
</style>