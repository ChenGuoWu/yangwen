<template>
	<div class="organization">
		<div class="one_level">
			<div class="header">
				<div class="query_info">
					<div class="query_item">
						<span>通知公告标题</span>
						<el-input v-model="queryForm.infromTitle" placeholder="请输入查询名称" class="search_query width_2rem"></el-input>
					</div>
					<div class="query_item">
						<span>发布时间</span>
						<el-date-picker class="search_query" v-model="queryForm.pubTime" value-format="yyyy-MM-dd" type="daterange" align="right"
						 unlink-panels range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions">
						</el-date-picker>
					</div>
					<div class="query_item">
						<span>单位</span>
						<el-select clearable :disabled="disabledQuery" placeholder="请选择查询单位" class="search_query width_2rem" v-model="queryForm.workUnits">
							<el-option v-for="item in unitList" :key="item.id" :label="item.unitName" :value="item.id"></el-option>
						</el-select>
					</div>
					<div class="query_item">
						<span>发布单位</span>
						<el-input v-model="queryForm.infromUnit" placeholder="请输入发布单位" class="search_query width_2rem"></el-input>
					</div>
					<div class="query_item">
						<span>发布状态</span>
						<el-select clearable class="search_query width_2rem" placeholder="请选择发布状态" v-model="queryForm.infromStatus">
							<el-option v-for="item in pubStatus" :key="item.value" :label="item.label" :value="item.value"></el-option>
						</el-select>
					</div>
				</div>
				<button class="add_btn" @click="addData">添加</button>
				<button class="pub_btn" @click="deleteData('more')">批量删除</button>
				<button class="pub_btn" @click="publish('more')">批量发布</button>
				<button class="search_btn" @click="resizeQuery">重置</button>
				<button class="search_btn" @click="init">查询</button>
			</div>
			<div class="table_content" v-loading="loading">
				<div class="table_box">
					<el-table height="100%" @selection-change="handleSelectionChange" :header-cell-style="{background:'#E1E8F4',color:'#333333',fontWeight:'bold'}"
					 :data="tableData" :cell-style="{padding: '0'}" :row-style="{height: '0.4rem'}" style="width: 100%; margin-bottom: 0.4rem;">
						<el-table-column align="center" :selectable="checkSelectable" type="selection" width="55">
						</el-table-column>
						<el-table-column type="index" label="序号" width="55" align="center">
						</el-table-column>
						<el-table-column :show-overflow-tooltip="true" prop="infromTitle" label="通知公告标题" width="450">
						</el-table-column>
						<el-table-column :show-overflow-tooltip="true" prop="infromUnit" label="发布单位" width="220">
						</el-table-column>
						<el-table-column prop="updateTime" label="发布时间" width="200">
						</el-table-column>
						<el-table-column prop="infromStatus" label="发布状态" width="150">
							<template slot-scope="scope">
								<span>{{scope.row.infromStatus == '1' ? '发布' : '未发布'}}</span>
							</template>
						</el-table-column>
						<el-table-column align="center" label="操作">
							<template slot-scope="scope">
								<el-button :disabled="scope.row.infromStatus == 1" style="padding: 0 0.3rem;" @click="editData(scope.row)" type="text"
								 size="small">编辑</el-button>
								<el-button :disabled="scope.row.infromStatus == 1" :style="{color: scope.row.infromStatus == 1 ? '#C0C4CC' : '#FF3D3D', padding:' 0 0.3rem'}"
								 @click="deleteData(scope.row)" type="text" size="small">删除</el-button>
								<el-button :style="{color: scope.row.infromStatus == 1 ? '#F48725' : '#409EFF', padding: '0 0.3rem'}" @click="publish(scope.row)"
								 type="text" size="small">{{scope.row.infromStatus != '1' ? '发布' : '取消'}}</el-button>
							</template>
						</el-table-column>
					</el-table>
				</div>
				<el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="page"
				 :page-sizes="pageSizes" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
				</el-pagination>
			</div>
		</div>
		<popup :overflow="true" :isShowUpload="true" v-loading="popupLoading" :popupWidth="'13'" :popupHeight="'7'" v-if="showPopup" @confim="saveData" @cancel="showPopup = false;resizeForm()"
		 :show='showPopup' :title="popupTitle" @upload="uploadFile">
			<el-form style="margin:0.2rem 0.2rem 0px 0px;" ref="addForm" :rules="rules" :model="addForm" label-width="120px">
				<el-form-item prop="infromTitle" label="公告标题">
					<el-input v-model="addForm.infromTitle"></el-input>
				</el-form-item>
				<el-form-item prop="infromUnit" label="单位">
					<el-select clearable :disabled="disabledQuery" placeholder="请选择查询单位" v-model="addForm.workUnits">
						<el-option v-for="item in unitList" :key="item.id" :label="item.unitName" :value="item.id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item prop="infromUnit" label="发布单位">
					<el-input v-model="addForm.infromUnit"></el-input>
				</el-form-item>
				<quill-editor style="height: 4rem;margin-left: 0.4rem;" v-model="addForm.infromContent" :options="editorOption" ref="content">
				</quill-editor>
				<el-upload
				  class="upload-demo"
				  ref="upload"
				  multiple
				  action=""
				  :http-request="uploadRequest"
				  :on-preview="handlePreview"
				  :on-remove="handleRemove"
				  :file-list="fileList"
				  :auto-upload="false">
				  <el-button style="display: none;" class="check_file" slot="trigger" size="small" type="primary">选取文件</el-button>
				</el-upload>
			</el-form>
		</popup>
	</div>
</template>

<script>
	import 'quill/dist/quill.core.css'
	import 'quill/dist/quill.snow.css'
	import 'quill/dist/quill.bubble.css'

	import {
		quillEditor
	} from 'vue-quill-editor'
	import popup from '../components/popup.vue';
	// 工具栏配置
	const toolbarOptions = [
		["bold", "italic", "underline", "strike"], // 加粗 斜体 下划线 删除线
		["blockquote", "code-block"], // 引用  代码块
		[{
			header: 1
		}, {
			header: 2
		}], // 1、2 级标题
		[{
			list: "ordered"
		}, {
			list: "bullet"
		}], // 有序、无序列表
		[{
			script: "sub"
		}, {
			script: "super"
		}], // 上标/下标
		[{
			indent: "-1"
		}, {
			indent: "+1"
		}], // 缩进
		// [{'direction': 'rtl'}],                         // 文本方向
		[{
			size: ["small", false, "large", "huge"]
		}], // 字体大小
		[{
			header: [1, 2, 3, 4, 5, 6, false]
		}], // 标题
		[{
			color: []
		}, {
			background: []
		}], // 字体颜色、字体背景颜色
		[{
			font: []
		}], // 字体种类
		[{
			align: []
		}], // 对齐方式
		["clean"], // 清除文本格式
		[ "image"] // 链接、图片、视频
	];

	export default {
		name: 'notice',
		components: {
			popup,
			quillEditor
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
					infromTitle: '',
					infromUnit: '',
					infromContent: '',
					workUnits: ''
				},
				rules: {
					infromTitle: [{
						required: true,
						message: '请输入公告标题',
						trigger: 'blur'
					}],
					workUnits: [{
						required: true,
						message: '请选择单位',
						trigger: 'change'
					}],
					infromUnit: [{
						required: true,
						message: '请输入发布单位',
						trigger: 'blur'
					}]
				},
				popupLoading: false, //弹窗loading
				queryForm: { //查询表单
					infromTitle: '',
					startTime: '',
					endTime: '',
					pubTime: '',
					infromStatus: '',
					infromUnit: '',
					workUnits: ''
				},
				editId: '', //修改数据id
				pubStatus: [{ //发布状态
					label: '发布',
					value: 1
				}, {
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
				multipleSelection: [], //表格选中的数据
				editorOption: { // 配置项
					theme: "snow", // or 'bubble'
					placeholder: "请输入文章内容",
					modules: {
						toolbar: {
							container: toolbarOptions,
							handlers: {}
						}
					},
				},
				uploadData: '', //上传数据
				fileList: [],  //上传文件list
				disabledQuery: false,  //在不是超级管理员时默认为当前人员单位（查询单位禁用）
				unitList:[],  //单位集合
			}
		},
		created() {
			this.getUnitList(0);
			this.userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
			if(this.userInfo.userRole != 1){
				this.queryForm.workUnits = this.userInfo.workUnits;
				this.disabledQuery = true;
			}
			this.init();
		},
		mounted() {
			document.getElementsByClassName('router_box')[0].style.height = '7.58rem';
		},
		beforeDestroy() {
			document.getElementsByClassName('router_box')[0].style.height = '7.1rem';
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
				if (data.pubTime) {
					data.startTime = data.pubTime[0];
					data.endTime = data.pubTime[1] + ' 23:59:59';
				}
				delete data.pubTime;
				this.$http.post('/rule/infrom/getRuleInfromByCondition', data).then(res => {
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
			//获取组织机构列表
			getUnitList(id){
				if(id === '') return;
				let requestUrl = '/rule/unit/getRuleUnitListByParentId',
					data = {
						id: id
					};
				this.$http.post(requestUrl, data).then(res => {
					if (res.code == '1') {
						this.unitList = res.data;
					} else {
						this.$message.error(res.msg);
					}
				}).catch(err => {
					console.log(err);
				})
			},
			//表格项是否可选择
			checkSelectable(row) {
			  return row.infromStatus != 1;
			},
			//表格多选事件
			handleSelectionChange(val) {
				this.multipleSelection = val;
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
			addData() {
				this.popupTitle = '添加';
				this.editId = '';
				this.addForm.workUnits = this.userInfo.workUnits;
				this.showPopup = true;
			},
			//上传到服务器
			uploadRequest(params){
				this.uploadData.append('file',params.file);//传文件
			},
			//添加数据
			saveData() {
				this.$refs['addForm'].validate((valid) => {
					if (valid) {
						this.uploadData = new FormData();
						this.popupLoading = true;
						this.$refs.upload.submit();
						this.publishData();
					}else{
						this.$message.warning('请确认必填项是否填写完整!');
					}
				});
			},
			//推送数据
			publishData(){
				if (!this.editId) {
					this.uploadData.append('infromTitle', this.addForm.infromTitle);
					this.uploadData.append('infromUnit', this.addForm.infromUnit);
					this.uploadData.append('workUnits', this.addForm.workUnits);
					this.uploadData.append('infromContent', this.addForm.infromContent);
					this.$http.post('/rule/infrom/insertRuleInfrom', this.uploadData, {
						headers: {
							"Content-Type": "application/x-www-form-urlencoded"
						}
					}).then(res => {
						if (res.code == '1') {
							this.popupLoading = false;
							this.showPopup = false;
							this.$message.success('添加成功！');
							this.resizeForm();
							this.init();
						} else {
							this.popupLoading = false;
							this.$message.error(res.msg);
						}
					}).catch(err => {
						this.popupLoading = false;
						console.log(err);
					})
				} else {
					this.uploadData.append('id', this.editId);
					this.uploadData.append('infromTitle', this.addForm.infromTitle);
					this.uploadData.append('infromUnit', this.addForm.infromUnit);
					this.uploadData.append('infromContent', this.addForm.infromContent);
					this.$http.post('/rule/infrom/updateRuleInfrom', this.uploadData, {
						headers: {
							"Content-Type": "application/x-www-form-urlencoded"
						}
					}).then(res => {
						if (res.code == '1') {
							this.popupLoading = false;
							this.showPopup = false;
							this.$message.success('修改成功！');
							this.resizeForm();
							this.init();
						} else {
							this.popupLoading = false;
							this.$message.error(res.msg);
						}
					}).catch(err => {
						this.popupLoading = false;
						console.log(err);
					})
				}
			},
			//重置添加内容
			resizeForm() {
				Object.keys(this.addForm).forEach(key => {
					this.addForm[key] = null;
				})
				this.fileList = [];
			},
			//编辑数据
			editData(row) {
				this.editId = row.id;
				this.popupTitle = '修改';
				Object.keys(this.addForm).forEach(key => {
					this.addForm[key] = row[key];
				})
				let arr = row['originalName'].split(',');
				let pathList = row['infromFileabsolutepath'].split(',');
				let lookPathList = row['infromFilepath'].split(',');
				arr.forEach((name, index) => {
					this.fileList.push({
						name: name,
						path: pathList[index],
						lookPath: lookPathList[index]
					})
				})
				this.showPopup = true;
			},
			//删除数据
			deleteData(row) {
				if (row == 'more' && this.multipleSelection.length == 0) {
					this.$message.warning('请选择需要操作的数据');
					return
				}
				this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					let ids = '';
					if (row == 'more') {
						ids = this.multipleSelection.map(item => {
							return item.id
						}).join(',');
					} else {
						ids = row.id;
					}
					let data = {
						ids: ids
					}
					this.$http.get('/rule/infrom/deleteRuleInfrom', data).then(res => {
						if (res.code == '1') {
							this.$message({
								type: 'success',
								message: '删除成功!'
							});
							this.init();
						} else {
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
			publish(row) {
				if (row == 'more' && this.multipleSelection.length == 0) {
					this.$message.warning('请选择需要操作的数据');
					return
				}
				this.$confirm(`您确定要${row.infromStatus == '1' ? '撤回' : '发布'}该通知公告吗？`, '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					let ids = '',
						status = '';
					if (row == 'more') {
						ids = this.multipleSelection.map(item => {
							return item.id
						}).join(',');
						status = '1';
					} else {
						ids = row.id;
						status = row.infromStatus == '1' ? '0' : '1';
					}
					let data = {
						ids: ids,
						status: status
					}
					this.$http.get('/rule/infrom/updateRuleInfromStatusById', data).then(res => {
						if (res.code == '1') {
							this.$message({
								type: 'success',
								message: '操作成功!'
							});
							this.init();
						} else {
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
			resizeQuery() {
				Object.keys(this.queryForm).forEach(key => {
					this.queryForm[key] = '';
				})
			},
			//弹窗点击上传文件
			uploadFile(){
				document.querySelector('.check_file').click();
			},
			handleRemove(file, fileList) {
				if(this.editId != ''){
					let data = {
						id: this.editId,
						delFileabsolutepath: file.path
					}
					this.$http.post('/rule/infrom/deleteFile', data).then(res => {
						if(res.code === 1){
							this.$message.success('删除文件成功！');
							this.init();
						}else{
							this.$message.error(res.msg);
						}
					}).catch(err => {
						console.log(err);
					})
				}
			},
			handlePreview(file) {
				window.open(file.lookPath);
			}
		}
	}
</script>

<style scoped="scoped" lang="scss">
	.one_level {
		.header {
			height: 122px;
			width: 100%;
			background: #FFFFFF;
			box-shadow: 0px 4px 7px 1px rgba(84, 137, 199, 0.09);
			border-radius: 10px;
			position: relative;
			.query_info{
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
				margin-right: 20px;
				border-radius: 4px;
				border: 1px solid #00479D;
				line-height: 32px;
				float: right;
			}
			.pub_btn{
				float: right;
				width: 80px;
				height: 32px;
				background: #00479D;
				color: white;
				border-radius: 4px;
				border: 1px solid #00479D;
				line-height: 32px;
				margin-top: 20px;
				margin-right: 20px;
			}
			.add_btn {
				width: 80px;
				height: 32px;
				background: #00A108;
				border-radius: 4px;
				font-size: 12px;
				color: #FFFFFF;
				border: 1px solid #00A108;
				float: right;
				cursor: pointer;
				margin-top: 20px;
				margin-right: 20px;
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
			height: 354px;
			overflow-y: auto;
		}
		.required{
			color: #F56C6C;
			position: relative;
			top: -37px;
		}
	}
	.ql-snow.ql-toolbar .ql-upload{
		background: url(../../assets/img/gb.png);
		background-size: 16px 16px;
		background-position: center center;
		background-repeat: no-repeat;
	}
	.organization /deep/ .popup_box .el-upload-list {
		margin: 0;
		padding: 0;
		list-style: none;
		margin-left: 40px;
		width: 300px;
		margin-top: 26px;
		padding-bottom: 20px;
	}
</style>
