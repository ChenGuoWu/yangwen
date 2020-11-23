<template>
	<div class="organization">
		<div class="plan_content" v-loading="loading">
			<div class="header">
				<span>{{planTitle}}</span>
				<span class="back_btn" @click="toBack">返回</span>
				<div class="line"></div>
			</div>
			<div class="form_content">
				<el-form label-position="top" :model="addForm" :rules="rules" ref="addForm" label-width="100px" class="demo-ruleForm">
					<el-form-item label="名称" prop="submitreportsName">
						<el-input :disabled="type == 'show'" placeholder="请输入名称" v-model="addForm.submitreportsName"></el-input>
					</el-form-item>
					<el-col :span="11">
						<el-form-item prop="submitreportsNature" label="制/修订">
							<el-select :disabled="type == 'show'" style="width: 100%;" v-model="addForm.submitreportsNature" clearable>
								<el-option v-for="(item, index) in systemOrRepair" :label="item.dicName" :value="item.dicCode" :key="item.dicCode"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="2"></el-col>
					<el-col :span="11">
						<el-form-item label="类别">
							<el-select :disabled="type == 'show'" style="width: 100%;" v-model="addForm.submitreportsType" clearable>
								<el-option v-for="(item, index) in planType" :label="item.dicName" :value="item.dicCode" :key="item.dicCode"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="11">
						<el-form-item label="起草部门">
							<el-input :disabled="type == 'show'" v-model="addForm.draftDepartment"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="2"></el-col>
					<el-col :span="11">
						<el-form-item label="主要起草人">
							<el-input :disabled="type == 'show'" v-model="addForm.draftMan"></el-input>
						</el-form-item>
					</el-col>
					<el-form-item label="参与起草单位">
						<el-input :disabled="type == 'show'" v-model="addForm.draftUnit"></el-input>
					</el-form-item>
					<el-col :span="11">
						<el-form-item label="开始时间" prop="draftStarttime">
							<el-date-picker :disabled="type == 'show'" value-format="yyyy-MM-dd" placeholder="选择时间" v-model="addForm.draftStarttime" style="width: 100%;"></el-date-picker>
						</el-form-item>
					</el-col>
					<el-col :span="2"></el-col>
					<el-col :span="11">
						<el-form-item label="结束时间" prop="draftStarttime">
							<el-date-picker :disabled="type == 'show'" value-format="yyyy-MM-dd" placeholder="选择时间" v-model="addForm.draftEndtime" style="width: 100%;"></el-date-picker>
						</el-form-item>
					</el-col>
					<el-form-item label="制修订必要性">
						<el-input :disabled="type == 'show'" rows="4" maxlength="200" type="textarea" placeholder="请输入制修订必要性(最多可输入200字)" v-model="addForm.revisionNecessity"></el-input>
					</el-form-item>
					<el-form-item label="拟采用新技术或科技成果等">
						<el-input :disabled="type == 'show'" rows="4" maxlength="200" type="textarea" placeholder="请输入拟采用新技术或科技成果等(最多可输入200字)" v-model="addForm.achievement"></el-input>
					</el-form-item>
					<el-form-item label="主要内容">
						<el-input :disabled="type == 'show'" rows="4" maxlength="200" type="textarea" placeholder="请输入主要内容(最多可输入200字)" v-model="addForm.submitReportsContent"></el-input>
					</el-form-item>
				</el-form>
			</div>
			<div class="footer" v-if="type != 'show'">
				<el-button class="save_btn" @click="saveData">保存</el-button>
				<el-button class="cancel_btn" @click="toBack">取消</el-button>
			</div>
		</div>
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
				addForm: { //查询表单
					revisionId: '',
					submitreportsName: '',
					submitreportsNature: '0',
					submitreportsType: '',
					draftDepartment: '',
					draftMan: '',
					draftUnit: '',
					draftStarttime: '',
					draftEndtime: '',
					revisionNecessity: '',
					achievement: '',
					submitReportsContent: ''
				},
				rules: {
					submitreportsName: [{ required: true, message: '请输入名称', trigger: 'blur' }],
					submitreportsNature: [{ required: true, message: '请选择制/修订', trigger: 'change' }],
					draftStarttime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
					draftEndtime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
				},
				systemOrRepair: [{ //制修订数组
					dicCode: '0',
					dicName: '制订'
				}, {
					dicCode: '1',
					dicName: '修订'
				}],
				planTitle: '新增提报',   //标题
				type: '',  //页面类型
				submitReportsId: '',  //提报id
				planType: [],   //计划类别
				loading: false,
			}
		},
		created() {
			this.addForm.revisionId = this.$route.query.id;
			this.type = this.$route.query.type;
			this.submitReportsId = this.$route.query.handlerId;
			this.planTitle = this.type == 'add' ? '新增提报' : this.type == 'edit' ? '修改提报' : '查看详情';
			this.addForm.draftMan = JSON.parse(sessionStorage.getItem('userInfo')).userName;
			this.getPlanType();
			if (this.type != 'add') {
				this.init();
			}
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
				this.$http.get('/rule/revisionSubmitReports/getRevisionSubmitReportsById', {
					submitReportsId: this.submitReportsId
				}).then(res => {
					this.loading = false;
					if (res.code == '1') {
						Object.keys(this.addForm).forEach(key => {
							this.addForm[key] = res.data[key];
						})
					} else {
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
			//保存数据
			saveData(){
				this.$refs['addForm'].validate((valid) => {
					if (valid) {
						this.popupLoading = true;
						if(this.type == 'add'){
							let data = {
								...this.addForm
							};
							this.$http.post('/rule/revisionSubmitReports/addRevisionSubmitReports', data).then(res =>{
								if(res.code == '1'){
									this.popupLoading = false;
									this.showPopup = false;
									this.$message.success('添加成功！');
									sessionStorage.setItem('revisionId', this.addForm.revisionId);
									this.$router.go(-1);
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
							data.submitReportsId = this.submitReportsId;
							this.$http.post('/rule/revisionSubmitReports/updateRevisionSubmitReports', data).then(res =>{
								if(res.code == '1'){
									this.popupLoading = false;
									this.showPopup = false;
									this.$message.success('修改成功！');
									sessionStorage.setItem('revisionId', this.addForm.revisionId);
									this.$router.go(-1);
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
						this.addForm.submitreportsType = res.data[0].dicCode;
					}
				}).catch(err => {
					console.log(err);
				})
			},
			//返回上一页并携带参数
			toBack(){
				sessionStorage.setItem('revisionId', this.addForm.revisionId);
				this.$router.go(-1);
			}
		},
	}
</script>

<style scoped="scoped" lang="scss">
	.plan_content {
		width: 1533px;
		height: 753px;
		background: #FFFFFF;
		box-shadow: 1px 4px 7px 2px rgba(84, 137, 200, 0.09);
		border-radius: 10px;
		float: left;
		.header{
			margin-left: 20px;
			margin-right: 20px;
			font-weight: bold;
			color: #343434;
			font-size: 14px;
			height: 48px;
			line-height: 48px;
			.back_btn{
				float: right;
				border: 1px solid #00489E;
				line-height: 32px;
				padding: 0 20px;
				margin-top: 10px;
				color: #00489E;
				font-weight: normal;
				cursor: pointer;
			}
			.line{
				width: 100%;
				height: 4px;
				background: #00489E;
				border-radius: 1px;
			}
		}
		.form_content{
			padding: 0 500px;
			height: 600px;
			overflow-y: auto;
			margin: 0 auto;
			margin-top: 25px;
			/deep/ .el-form-item__label{
				padding: 0 !important;
				line-height: 30px !important;
			}
			/deep/ .el-col-2{
				height: 19px;
			}
		}
		.footer{
			display: flex;
			width: 240px;
			margin: 0 auto;
			margin-top: 20px;
			.save_btn, .cancel_btn{
				width: 80px;
				line-height: 32px;
				height: 32px;
				background: #00489E;
				border: 1px solid #00489E;
				border-radius: 2px;
				color: #ffffff;
			}
			.cancel_btn{
				color: #00489E;
				margin-left: 20px;
				background: #FFFFFF;
			}
			/deep/ .el-button{
				padding: 0;
			}
		}
	}
</style>
