<template>
	<div class="organization">
		<div class="one_level">
			<div class="header">
				<div class="query_info">
					<div class="query_item">
						<span>名称</span>
						<el-input v-model="queryForm.linkName" placeholder="请输入查询名称" class="search_query width_2rem"></el-input>
					</div>
					<div class="query_item">
						<span>发布时间</span>
						<el-date-picker
							class="search_query"
						    v-model="queryForm.pubTime"
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
						<span>发布状态</span>
						<el-select clearable class="search_query width_2rem" placeholder="请选择发布状态" v-model="queryForm.linkStatus">
							<el-option v-for="item in pubStatus" :key="item.value" :label="item.label" :value="item.value"></el-option>
						</el-select>
					</div>
				</div>
				<button class="search_btn" @click="init">查询</button>
				<button class="search_btn" @click="resizeQuery">重置</button>
				<button class="add_btn" @click="addData">添加</button>
				<button class="pub_btn" @click="publish('more')">批量发布</button>
			</div>
			<div class="table_content" v-loading="loading">
				<div class="table_box">
					<el-table height="100%" @selection-change="handleSelectionChange" :header-cell-style="{background:'#E1E8F4',color:'#333333',fontWeight:'bold'}" :data="tableData" :cell-style="{padding: '0'}" :row-style="{height: '0.4rem'}" style="width: 100%; margin-bottom: 0.4rem;">
						<el-table-column
							align="center"
							:selectable="checkSelectable"
							type="selection"
							width="55">
						</el-table-column>
						<el-table-column type="index" label="序号" width="55" align="center">
						</el-table-column>
						<el-table-column :show-overflow-tooltip="true" prop="linkName" label="名称" width="220">
						</el-table-column>
						<el-table-column :show-overflow-tooltip="true" prop="linkUrl" label="URL" width="380">
						</el-table-column>
						<el-table-column prop="updateTime" label="发布时间" width="220">
						</el-table-column>
						<el-table-column prop="linkStatus" label="发布状态" width="220">
							<template slot-scope="scope">
								<span>{{scope.row.linkStatus == '1' ? '发布' : '未发布'}}</span>
							</template>
						</el-table-column>
						<el-table-column align="center" label="操作">
							<template slot-scope="scope">
								<el-button :disabled="scope.row.linkStatus == 1" style="padding: 0 0.3rem;" @click="editData(scope.row)" type="text" size="small">编辑</el-button>
								<el-button :disabled="scope.row.linkStatus == 1" :style="{color: scope.row.linkStatus == 1 ? '#C0C4CC' : '#FF3D3D', padding:' 0 0.3rem'}" @click="deleteData(scope.row)" type="text" size="small">删除</el-button>
								<el-button :style="{color: scope.row.linkStatus == 1 ? '#F48725' : '#409EFF', padding: '0 0.3rem'}" @click="publish(scope.row)" type="text" size="small">{{scope.row.linkStatus != '1' ? '发布' : '取消'}}</el-button>
							</template>
						</el-table-column>
					</el-table>
				</div>
				<el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="page"
				 :page-sizes="pageSizes" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
				</el-pagination>
			</div>
		</div>
		<popup v-loading="popupLoading" :popupHeight="'2.7'" v-if="showPopup" @confim="saveData" @cancel="showPopup = false;resizeForm()" :show='showPopup' :title="popupTitle">
			<el-form style="margin:0.2rem 0.2rem 0px 0px;" ref="addForm" :rules="rules" :model="addForm" label-width="60px">
				<el-form-item prop="linkName" label="名称">
					<el-input v-model="addForm.linkName"></el-input>
				</el-form-item>
				<el-form-item prop="linkUrl" label="URL">
					<el-input v-model="addForm.linkUrl"></el-input>
				</el-form-item>
			</el-form>
		</popup>
	</div>
</template>

<script>
	import popup from '../components/popup.vue';
	export default {
		name: 'aboutLink',
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
					linkName : "",
					linkUrl : ""
				},
				rules: {
					linkName: [{
						required: true,
						message: '请输入名称',
						trigger: 'blur'
					}],
					linkUrl: [{
						required: true,
						message: '请输入URL',
						trigger: 'blur'
					}]
				},
				popupLoading: false,  //弹窗loading
				queryForm: {  //查询表单
					linkName: '',
					startTime: '',
					endTime: '',
					pubTime: '',
					linkStatus: ''
				},
				editId: '', //修改数据id
				pubStatus: [{   //发布状态
					label: '发布',
					value: 1
				},{
					label: '未发布',
					value: 0
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
				multipleSelection: [],  //表格选中的数据
			}
		},
		created() {
			this.init();
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
				if(data.pubTime){
					data.startTime = data.pubTime[0];
					data.endTime = data.pubTime[1] + ' 23:59:59';
				}
				delete data.pubTime;
				this.$http.get('/rule/link/getByCondition', data).then(res => {
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
			//表格多选事件
			handleSelectionChange(val){
				this.multipleSelection = val;
			},
			//表格项是否可选择
			checkSelectable(row) {
			  return row.linkSt != 1;
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
				this.$refs['addForm'].validate((valid) => {
					if (valid) {
						this.popupLoading = true;
						if(!this.editId){
							let data = {
								...this.addForm
							};
							this.$http.post('/rule/link/insertRuleLink', data).then(res =>{
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
							this.$http.post('/rule/link/updateRuleLink', data).then(res =>{
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
			//编辑数据
			editData(row){
				this.editId = row.id;
				this.popupTitle = '修改';
				Object.keys(this.addForm).forEach(key => {
					this.addForm[key] = row[key];
				})
				this.showPopup = true;
			},
			//删除数据
			deleteData(row){
				this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					this.$http.get('/rule/link/deleteRuleLink',{id: row.id}).then(res=>{
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
			//发布/取消发布
			publish(row){
				if(row == 'more' && this.multipleSelection.length == 0){
					this.$message.warning('请选择需要操作的数据');
					return
				}
				this.$confirm(`您确定要${row.linkStatus == '1' ? '撤回' : '发布'}链接吗？`, '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					let ids = '',
						status = '';
					if(row == 'more'){
						ids = this.multipleSelection.map(item => {
							return item.id
						}).join(',');
						status = '1';
					}else{
						ids = row.id;
						status = row.linkStatus == '1' ? '0' : '1';
					}
					let data = {
						ids: ids,
						status: status
					}
					this.$http.get('/rule/link/updateRuleLinkStatusById',data).then(res=>{
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
			//重置查询表单
			resizeQuery(){
				Object.keys(this.queryForm).forEach(key => {
					this.queryForm[key] = '';
				})
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
