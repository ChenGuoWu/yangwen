<template>
	<div class="upload_file">
		<rule-survey ref="ruleSurvey"></rule-survey>
		<div class="container">
			<div class="header">
				<span>规章内容</span>
				<span class="line"></span>
			</div>
			<div class="content">
				<div class="item_header">
					<span>规章文件</span>
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
					<el-button class="handler_btn" @click="checkFile">选择</el-button>
				</div>
				<div class="item_content">
					<span>关键字</span>
					<el-input v-model="addForm.ruleKeywords" style="width: 4.13rem;" placeholder="添加多个关键字用空格分开"></el-input>
					<span>适用范围</span>
					<el-select class="search_query width_2rem" v-model="addForm.ruleAppScope" filterable clearable>
						<el-option v-for="item in scopeOfApplicationList" :label="item.dicName" :value="item.dicCode" :key="item.dicCode"></el-option>
					</el-select>
				</div>
				<div class="item_header">
					<span>依据的技术规章</span>
					<el-button class="handler_btn" @click="relationHandler('1')">关联</el-button>
				</div>
				<div class="item_contents">
					<div class="basis_item" v-for="(item, index) in basisRelationList" :key="index">
						<span class="label">{{item.ruleTitle}}</span>
						<i class="el-icon-delete" @click="deletRelation(item.ruleId, basisRelationList, index, '1')"></i>
					</div>
				</div>
				<div class="item_header">
					<span>废止的技术规章</span>
					<el-button class="handler_btn" @click="relationHandler('2')">关联</el-button>
				</div>
				<div class="abolish_content">
					<div class="abolish_item" v-for="(item, index) in abolishRelationList" :key="index">
						<span class="label">{{item.ruleTitle}}</span>
						<i class="el-icon-delete" @click="deletRelation(item.ruleId, abolishRelationList, index, '2')"></i>
						<div>
							<span>失效时间</span>
							<el-date-picker :disabled="disabledCheck[index] == 'DIC-0021' || disabledCheck[index] == 'DIC-0022'" type="date" v-model="addForm.ruleExpDate[index]" placeholder="选择日期" :value-format="'yyyy-MM-dd'"></el-date-picker>
							<span>失效原因</span>
							<el-select :disabled="disabledCheck[index] == 'DIC-0021' || disabledCheck[index] == 'DIC-0022'" class="search_query" v-model="addForm.ruleExpCause[index]" filterable clearable>
								<el-option v-for="item in failureReasonList" :label="item.dicName" :value="item.dicCode" :key="item.dicCode"></el-option>
							</el-select>
						</div>
					</div>
				</div>
				<div class="item_header">
					<span>补充的技术规章</span>
					<el-button class="handler_btn" @click="relationHandler('3')">关联</el-button>
				</div>
				<div class="item_contents">
					<div class="basis_item" v-for="(item, index) in supplyRelationList" :key="index">
						<span class="label">{{item.ruleTitle}}</span>
						<i class="el-icon-delete" @click="deletRelation(item.ruleId, supplyRelationList, index, '3')"></i>
					</div>
				</div>
				<div class="item_header" v-if="supplyRelationList.length > 0">
					<span>完整技术规章</span>
					<el-upload
					  class="upload-demo"
					  ref="upload"
					  multiple
					  action=""
					  :http-request="uploadRequests"
					  :on-preview="handlePreviews"
					  :on-remove="handleRemoves"
					  :file-list="fileLists">
					  <el-button style="display: none;" class="check_files" slot="trigger" size="small" type="primary">选取文件</el-button>
					</el-upload>
					<el-button class="handler_btn" @click="checkFiles">选择</el-button>
				</div>
				<div class="item_header">
					<span>制修订计划</span>
					<el-button class="handler_btn" @click="relationHandler('4')">关联</el-button>
				</div>
				<div class="item_contents">
					<div class="basis_item" v-for="(item, index) in revisionCheckedList" :key="index">
						<span class="label">{{item.submitreportsName}}</span>
						<i class="el-icon-delete" @click="deletRelation(item.submitReportsId, revisionCheckedList, index, '4')"></i>
					</div>
				</div>
			</div>
			<div class="footer">
				<button class="save" @click="saveData">保存</button>
				<button class="cancel" @click="$router.go(-1);">取消</button>
			</div>
			<popup :popupWidth="'13'" :popupHeight="'7.63'" v-if="showPopup" @confim="relationData" @cancel="showPopup = false; multipleSelection = [];" :show='showPopup' :title="popupTitle">
				<div class="pop_header">
					<div class="query_info">
						<div class="query_item" v-if="relationType != '4'">
							<span>名称</span>
							<el-input v-model="queryForm.ruleTitle" placeholder="请输入名称" class="search_query width_2rem"></el-input>
						</div>
						<div class="query_item" v-if="relationType != '4'">
							<span>规章编号</span>
							<el-input v-model="queryForm.ruleNo" placeholder="请输入规章编号" class="search_query width_2rem"></el-input>
						</div>
						<div class="query_item" v-if="relationType != '4'">
							<span>规章文号</span>
							<el-input v-model="queryForm.ruleDocNo" placeholder="请输入规章文号" class="search_query width_2rem"></el-input>
						</div>
						<!-- <div class="query_item" v-if="relationType != '4'">
							<span>所属层级</span>
							<el-select class="search_query width_2rem" placeholder="请选择所属层级" v-model="queryForm.unitLevel" filterable clearable>
								<el-option v-for="item in levelList" :label="item.dicName" :value="item.dicCode" :key="item.dicCode"></el-option>
							</el-select>
						</div> -->
						<div class="query_item" v-if="relationType == '4' && userRole == '1'">
							<span>一级组织机构</span>
							<el-select class="search_query width_2rem" @change="changeOrg" v-model="queryForm.selectWorkUnits" clearable>
								<el-option v-for="(item, index) in orgnizationList" :label="item.unitName" :value="item.id" :key="item.id"></el-option>
							</el-select>
						</div>
						<div class="query_item" v-if="relationType == '4'">
							<span>制修订名称</span>
							<el-select v-model="queryForm.revisionId" filterable class="search_query width_2rem">
								<el-option v-for="(item, index) in revisionPlanList" :label="item.revisionName" :value="item.id" :key="item.id"></el-option>
							</el-select>
						</div>
					</div>
					<button class="search_btn" @click="initTableData">查询</button>
				</div>
				<div class="pop_content">
					<div class="table_box">
						<el-table height="100%" v-loading="tableLoading" ref="multipleTable" @select="select" @selection-change="handleSelectionChange" :header-cell-style="{background:'#E1E8F4',color:'#333333',fontWeight:'bold'}"
						 :data="popTableData" :cell-style="{padding: '0'}" :row-style="{height: '0.4rem'}" style="width: 100%; margin-bottom: 0.4rem;">
							<el-table-column align="center" type="selection" width="55">
							</el-table-column>
							<el-table-column :show-overflow-tooltip="true" :prop="relationType == '4' ? 'submitreportsName' : 'ruleTitle'" :label="relationType == '4' ? '制修订名称' : '名称'">
							</el-table-column>
							<el-table-column v-if="relationType != '4'" :show-overflow-tooltip="true" prop="ruleDocNo" label="规章文号" width="240">
							</el-table-column>
							<el-table-column v-if="relationType != '4'" prop="ruleNo" label="规章编号" width="240">
							</el-table-column>
							<el-table-column v-if="relationType != '4'" prop="ruleDomainName" label="专业" width="200">
							</el-table-column>
							<el-table-column v-if="relationType == '4'" prop="submitreportsNatureName" label="制/修订" width="100">
							</el-table-column>
							<el-table-column v-if="relationType == '4'" prop="submitreportsTypeName" label="类别" width="100">
							</el-table-column>
							<el-table-column v-if="relationType == '4'" prop="draftDepartment" label="起草部门" width="120">
							</el-table-column>
							<el-table-column v-if="relationType == '4'" prop="submissionDate" width="120" label="提交日期" align="center">
							</el-table-column>
						</el-table>
					</div>
					<el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="page"
					 :page-sizes="pageSizes" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
					</el-pagination>
				</div>
			</popup>
			<popup :popupWidth="'6'" :popupHeight="'5.63'" v-if="showPopups" :readOnly="true" @cancel="invalidHandler('clear')" :show='showPopups' :title="'提示'">
				<div class="popup_content">
					<div class="content_item" v-for="(item, index) in invalidApplyList" :key="index">
						<el-checkbox v-model="item.checked"></el-checkbox>
						<span>{{item.ruleName}}</span>
					</div>
				</div>
				<div class="popup_footer">
					<el-button @click="invalidHandler('check')">提请失效</el-button>
				</div>
			</popup>
		</div>
	</div>
</template>

<script>
	import ruleSurvey from '../components/ruleSurvey.vue';
	import popup from '../components/popup.vue';
	export default{
		name: 'uploadFile',
		components:{
			ruleSurvey,
			popup
		},
		data(){
			return{
				addForm: {
					ruleAppScope: '',
					ruleExpDate: [],
					ruleExpCause: [],
					ruleKeywords: ''
				},
				pageSizes: [10, 15, 20, 25, 30], //可选择显示条数
				pageSize: 10, //每页显示条数，默认为10
				page: 1, //当前页数，默认为1
				total: 0, //数据总条数
				popTableData: [],  //弹窗表格数据
				failureReasonList: [],   //失效原因问题
				scopeOfApplicationList: [],  //适用范围
				fileList: [],  //文件上传
				fileLists: [],  //文件上传
				fileIdList: [],  //上传文件id集合
				fileIdLists: [],  //上传文件id集合
				showPopup: false,  //显示弹窗
				showPopups: false,  //失效弹窗
				popupTitle: '关联',   //弹窗标题
				queryForm: {
					ruleTitle: '',
					ruleDocNo: '',
					ruleNo: '',
					// unitLevel: '',
					selectWorkUnits: '',
					revisionId: ''
				},
				levelList: [{   //所属层级集合
					dicName: '国铁',
					dicCode: 'DIC-001'
				},{
					dicName: '路局',
					dicCode: 'DIC-002'
				}],
				multipleSelection: [],  //表格多选数据
				basisRelationList: [],  //依据规章关联数据
				abolishRelationList: [],  //废止规章关联数据
				supplyRelationList: [],  //补充规章关联数据
				revisionCheckedList: [],  //制修订关联数据
				relationType: '1',  //关联类型
				majorList: [],  //专业集合
				ruleId: '',  //规章id
				tableLoading: false,  //表格加载loading
				ruleInfo: {},  //规章信息
				orgnizationList: [],   //一级组织机构
				revisionPlanList: [],   //制修订名称
				userRole: '',  //用户权限
				systemOrRepair: [{  //制修订数组
					dicCode: '0',
					dicName: '制订'
				},{
					dicCode: '1',
					dicName: '修订'
				}],
				planType: [],   //计划类别
				disabledCheck: [],   //禁止已失效与待失效数据进行重新选择失效时间与原因
				invalidApplyList: [],  //未提请失效与提请失效被退回数据
			}
		},
		created() {
			this.getFailureReason();
			this.getScopeOfApplication();
			this.ruleId = this.$route.query.id;
			this.init();
		},
		mounted() {
			this.getMajorList();
			this.getPlanType();
		},
		methods:{
			//初始化数据
			init(){
				let data = new FormData();
				data.append('ruleId', this.ruleId);
				this.$http.post('rule/prop/getPropByRuleId', data, {
					headers: {
						"Content-Type": "application/x-www-form-urlencoded"
					}
				}).then(res => {
					if (res.code == '1') {
						this.ruleInfo = res.data;
						this.addForm.ruleAppScope = res.data.ruleAppScope;
						this.addForm.ruleKeywords = res.data.ruleKeywords;
						this.addForm.ruleExpCause = res.data.ruleExpCause ? res.data.ruleExpCause.split(",") : [];
						this.addForm.ruleExpDate = res.data.ruleExpDateStr ?  res.data.ruleExpDateStr : [];
						if(res.data.ruleExpStatusList && res.data.ruleExpStatusList.length > 0){
							this.disabledCheck = res.data.ruleExpStatusList;
						}
						if(res.data.auditStatusList && res.data.auditStatusList.length > 0){
							let idList = res.data.revocatoryRulesId.split(",");
							res.data.auditStatusList.forEach((item, index) => {
								if(item === 0 || item === 2){
									this.invalidApplyList.push({
										ruleName: res.data.revocatoryRulesName[index],
										ruleId: idList[index],
										checked: true
									})
								}
							})
							if(this.invalidApplyList.length > 0){
								this.showPopups = true;
							}
						}
						if(res.data.ruleFileId && res.data.ruleFileName){
							this.fileIdList = res.data.ruleFileId.split(",");
							res.data.ruleFileName.forEach((item, index) => {
								this.fileList.push({
									name: item,
									fileId: this.fileIdList[index]
								})
							});
						}
						if(res.data.wholeRulesId && res.data.wholeRulesName){
							this.fileIdLists = res.data.wholeRulesId.split(",");
							res.data.wholeRulesName.forEach((item, index) => {
								this.fileLists.push({
									name: item,
									fileId: this.fileIdLists[index]
								})
							});
						}
						if(res.data.pursuantRulesId && res.data.pursuantRulesName){
							let arr = res.data.pursuantRulesId.split(",");
							res.data.pursuantRulesName.forEach((item, index) => {
								this.basisRelationList.push({
									ruleId: arr[index],
									ruleTitle: item
								})
							});
						}
						if(res.data.remakePlanId && res.data.remakePlanName){
							let arr = res.data.remakePlanId.split(",");
							res.data.remakePlanName.forEach((item, index) => {
								this.revisionCheckedList.push({
									submitReportsId: arr[index],
									submitreportsName: item
								})
							});
							
						}
						if(res.data.revocatoryRulesId && res.data.revocatoryRulesName){
							let arr1 = res.data.revocatoryRulesId.split(",");
							res.data.revocatoryRulesName.forEach((item, index) => {
								this.abolishRelationList.push({
									ruleId: arr1[index],
									ruleTitle: item
								})
							});
						}
						if(res.data.supplementaryRulesId && res.data.supplementaryRulesName){
							let id = res.data.supplementaryRulesId;
							res.data.supplementaryRulesName.forEach((item, index) => {
								this.supplyRelationList.push({
									ruleId: id,
									ruleTitle: item
								})
							});
						}
					} else {
						this.$message.error(res.msg);
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
			//修改每页显示条数
			handleSizeChange(val) {
				this.pageSize = val;
				this.page = 1;
				this.initTableData();
			},
			//修改当前显示页
			handleCurrentChange(val) {
				this.page = val;
				this.initTableData();
			},
			//加载关联数据
			initTableData(){
				this.popTableData = [];
				this.total = 0;
				this.tableLoading = true;
				if(this.relationType != '4'){
					let data = new FormData();
					data.append('ruleTitle', this.queryForm.ruleTitle);
					data.append('ruleId', this.ruleId);
					data.append('ruleNo', this.queryForm.ruleNo);
					data.append('ruleDocNo', this.queryForm.ruleDocNo);
					// data.append('unitLevel', this.queryForm.unitLevel);
					data.append('ruleUnitLevel', this.ruleInfo['unitLevel']);
					data.append('ownUnitId', this.ruleInfo['ownUnitId']);
					data.append('pageIndex', this.page);
					data.append('pageSize', this.pageSize);
					let url = '/rule/prop/selectRuleFileByAccording';
					if(this.relationType == '2'){
						url = '/rule/prop/selectRuleFileByDisable';
						// data.delete('unitLevel');
					}
					if(this.relationType == '3'){
						url = '/rule/prop/selectRuleFileByReplenish';
					}
					this.$http.post(url, data).then(res => {
						this.tableLoading = false;
						if(res.code == '1'){
							this.popTableData = res.data;
							this.total = res.pageInfo.total;
							this.majorList.forEach(item => {
								this.popTableData.forEach(items => {
									if(item.dicCode == items.ruleDomain){
										items.ruleDomainName = item.dicName;
									}
								})
							})
							let array = [];
							if(this.relationType == '1') array = this.basisRelationList.map(item => {return item.ruleId});
							if(this.relationType == '2') array = this.abolishRelationList.map(item => {return item.ruleId});
							if(this.relationType == '3') array = this.supplyRelationList.map(item => {return item.ruleId});
							this.$nextTick(()=>{
							  this.$refs.multipleTable.clearSelection();
							  this.popTableData.forEach(row => {
							    if(array.indexOf(row.ruleId) >= 0){
							      this.$refs.multipleTable.toggleRowSelection(row,true);
							    }
							  })
							})
						}else{
							this.$message.error(res.msg);
						}
					}).catch(err => {
						this.tableLoading = false;
						console.log(err);
					})
				}else{
					if(!this.queryForm.revisionId){
						this.$message.warning('请先选择制修订名称');
						return;
					}
					let data = {
						revisionId: this.queryForm.revisionId,						submitreportsNature: '',						submitreportsType: '',						draftDepartment: '',						keyWord: '',						draftStarttime: '',						draftEndtime: '',						status: '3'					};
					this.$http.post('/rule/revisionSubmitReports/getAuditRevisionSubmitReportsByCondition', data).then(res => {
						if(res.code == '1'){
							this.popTableData = res.data;
							this.systemOrRepair.forEach(item => {
								res.data.forEach(items => {
									if(item.dicCode == items.submitreportsNature){
										items.submitreportsNatureName = item.dicName;
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
							let array = [];
							if(this.relationType == '4') array = this.revisionCheckedList.map(item => {return item.submitReportsId});
							this.$nextTick(()=>{
							  this.$refs.multipleTable.clearSelection();
							  this.popTableData.forEach(row => {
							    if(array.indexOf(row.submitReportsId) >= 0){
							      this.$refs.multipleTable.toggleRowSelection(row,true);
							    }
							  })
							})
							this.tableLoading = false;
						}else{
							this.tableLoading = false;
							this.$message.error(res.msg);
						}
					}).catch(err => {
						console.log(err);
					})
				}
			},
			//提请失效处理
			invalidHandler(type){
				if(type == 'check'){
					this.invalidApplyList = this.invalidApplyList.filter(item => {
						return !item.checked;
					})
				}
				this.invalidApplyList.forEach(item => {
					this.abolishRelationList.forEach((items, index) => {
						if(item.ruleId == items.ruleId){
							this.abolishRelationList.splice(index, 1);
							this.addForm.ruleExpCause.splice(index, 1);
							this.addForm.ruleExpDate.splice(index, 1);
						}
					})
				})
				this.showPopups = false;
			},
			//点击选择上传
			checkFile() {
				document.querySelector('.check_file').click();
			},
			//点击选择上传
			checkFiles() {
				document.querySelector('.check_files').click();
			},
			//关联数据
			relationData() {
				if(this.relationType == '1') this.basisRelationList = this.unique([...this.basisRelationList, ...this.multipleSelection], 'ruleId');
				if(this.relationType == '2'){
					this.abolishRelationList = this.unique([...this.abolishRelationList, ...this.multipleSelection], 'ruleId');
					this.disabledCheck = this.abolishRelationList.map(item => {
						return item.ruleExpStatus;
					})
				}
				if(this.relationType == '3') this.supplyRelationList = this.unique([...this.supplyRelationList, ...this.multipleSelection], 'ruleId');
				if(this.relationType == '4') this.revisionCheckedList = this.unique([...this.revisionCheckedList, ...this.multipleSelection], 'submitReportsId');
				this.multipleSelection = [];
				this.showPopup = false;
			},
			//对关联数据进行去重
			unique(arr1, key) {
			  const res = new Map();
			  return arr1.filter((a) => !res.has(a[key]) && res.set(a[key], 1));
			},
			//表格选择事件
			select(selection, row){
				if(this.relationType == '3'){
					// 清除所有选中
					this.supplyRelationList = [];
					this.multipleTable = [];
					this.$refs.multipleTable.clearSelection();
				}
				if (selection.length === 0) return
				// 将当前点击项选中
				this.$refs.multipleTable.toggleRowSelection(row, true);
			},
			//表格多选事件
			handleSelectionChange(val){
				this.multipleSelection = val;
				if(this.relationType == '3') this.multipleSelection = [val[val.length - 1]];
			},
			//关联操作
			relationHandler(type) {
				this.relationType = type;
				if(type== '4'){
					if(JSON.parse(sessionStorage.getItem('userInfo')).userRole == 1){
						this.userRole = 1;
						this.$http.post('/rule/unit/getRuleUnitListByParentId', {
								id: 0
							}).then(res => {
							if (res.code == '1') {
								this.orgnizationList = res.data;
								this.queryForm.selectWorkUnits = res.data[0].id;
								this.getRevisionPlanList();
							} else {
								this.$message.error(res.msg);
							}
						}).catch(err => {
							console.log(err);
						})
					}else{
						this.queryForm.selectWorkUnits = JSON.parse(sessionStorage.getItem('userInfo')).unitId;
						this.getRevisionPlanList();
					}
				}else{
					this.showPopup = true;
					this.initTableData();
				}
				
			},
			//获取制修订数据
			getRevisionPlanList(){
				this.$http.get('/rule/revisionManage/getRuleRevisionManageByName', {
					revisionName: '',
					selectWorkUnits: this.queryForm.selectWorkUnits,
					pageIndex: 1,
					pageSize: 999
				}).then(res => {
					if (res.code == '1') {
						this.revisionPlanList = res.data;
						if(!res.data || res.data.length == 0){
							delete this.queryForm.revisionId;
							this.popTableData = [];
						}
						this.queryForm.revisionId = res.data[0].id;
						this.showPopup = true;
						this.initTableData();
					} else {
						this.revisionPlanList = [];
						this.popTableData = [];
						if(!res.data || res.data.length == 0) delete this.queryForm.revisionId;
						this.$message.error(res.msg);
					}
				}).catch(err => {
					console.log(err);
				})
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
			//自定义上传参数
			uploadRequest(params){
				let data = new FormData();
				data.append('file',params.file);//传文件
				data.append('topUnitId', this.$refs['ruleSurvey'].ruleInfo.topUnitId);
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
						this.$message.success('添加成功！');
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
					}else{
						this.$message.error(res.msg);
					}
				}).catch(err => {
					console.log(err);
				})
			},
			//自定义上传参数
			uploadRequests(params){
				let data = new FormData();
				data.append('file',params.file);//传文件
				data.append('topUnitId', this.$refs['ruleSurvey'].ruleInfo.topUnitId);
				this.$http.post('/rule/file/uploadRuleFile', data, {
					headers: {
						"Content-Type": "application/x-www-form-urlencoded"
					}
				}).then(res => {
					if (res.code == '1') {
						this.fileLists.push({
							name: res.data.ruleFileName,
							fileId: res.data.id
						})
						this.fileIdLists.push(res.data.id);
						this.$message.success('添加成功！');
					} else {
						this.$message.error(res.msg);
					}
				}).catch(err => {
					console.log(err);
				})
			},
			//修改组织机构查询相对应的制修订计划
			changeOrg(val){
				this.getRevisionPlanList();
			},
			//点击查看文件
			handlePreviews(file){
				console.log(file);
			},
			//点击移除文件
			handleRemoves(file, fileList){
				this.fileIdLists = this.fileIdLists.filter(item => {
					return item !== file.fileId
				})
				this.$http.post('/rule/file/delRuleFile', {
					id: file.fileId
				}).then(res => {
					if(res.code == '1'){
						this.$message.success('移除成功');
					}else{
						this.$message.error(res.msg);
					}
				}).catch(err => {
					console.log(err);
				})
			},
			//解除关联
			deletRelation(id, arr, index, type){
				this.$confirm('您确定要解除该规章文件的关联吗?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					arr = arr.filter(item => {
						return item.ruleId != id;
					})
					if(type == '4'){
						arr = arr.filter(item => {
							return item.submitReportsId != id;
						})
					}
					if(type == '1') this.basisRelationList = arr;
					if(type == '2'){
						this.abolishRelationList = arr;
						this.addForm.ruleExpDate.splice(index, 1);
						this.addForm.ruleExpCause.splice(index, 1);
					}
					if(type == '3'){
						this.supplyRelationList = arr;
						this.fileLists = [];
						this.fileIdLists = [];
					}
					if(type == '4') this.revisionCheckedList = arr;
				}).catch(() => {
					this.$message({
						type: 'info',
						message: '已取消删除'
					});
				});
			},
			//获取适用范围字典表
			getScopeOfApplication(){
				let data = new FormData();
				data.append('dicType', 7);
				this.$http.post('/rule/dataDic/getDataDicByType', data, {
					headers: {
						"Content-Type": "application/x-www-form-urlencoded"
					}
				}).then(res => {
					if(res.code == '1'){
						this.scopeOfApplicationList = res.data;
					}else{
						this.$message.error(msg);
					}
				}).catch(err => {
					console.log(err);
				})
			},
			//保存数据
			saveData(){
				this.saveLoading = true;
				try{
					this.abolishRelationList.forEach((item, index) => {
						if(!this.addForm.ruleExpDate[index] || !this.addForm.ruleExpCause[index]){
							throw '11';
						}
					})
				}catch(err){
					this.$message.error('请选择每一项的失效时间与失效原因。');
					return;
				}
				let mapBasisRelationId = this.basisRelationList.map(item => {
					return item.ruleId;
				});
				let mapAbolishRelatio = this.abolishRelationList.map(item => {
					return item.ruleId;
				});
				let mapSupplyRelation = this.supplyRelationList.map(item => {
					return item.ruleId;
				});
				let mapRevisionChecked = this.revisionCheckedList.map(item => {
					return item.submitReportsId;
				})
				let data = {
					ruleId: this.ruleId,
					ownClassId: this.ruleInfo.ownClassId,
					ruleAppScope: this.addForm.ruleAppScope,
					ruleKeywords: this.addForm.ruleKeywords,
					ruleFileId: this.fileIdList.length > 0 ? this.fileIdList.join(',') : '',
					ruleExpDateStr: this.addForm.ruleExpDate.length > 0 ? this.addForm.ruleExpDate : [],
					ruleExpCause: this.addForm.ruleExpCause.length > 0 ? this.addForm.ruleExpCause.join(',') : '',
					pursuantRulesId: mapBasisRelationId.length > 0 ? mapBasisRelationId.join(',') : '',
					revocatoryRulesId: mapAbolishRelatio.length > 0 ? mapAbolishRelatio.join(',') : '',
					supplementaryRulesId: mapSupplyRelation.length > 0 ? mapSupplyRelation.join(',') : '',
					wholeRulesId: this.fileIdLists.length > 0 ? this.fileIdLists.join(',') : '',
					remakePlanId: mapRevisionChecked.length > 0 ? mapRevisionChecked.join(',') : '',
				}
				this.$http.post('/rule/prop/updateRulePropRelation', data).then(res => {
					this.saveLoading = false;
					if(res.code == '1'){
						this.$message.success('保存成功!');
						this.$router.go(-1);
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
		}
	}
</script>

<style lang="scss" scoped="scoped">
	.upload_file{
		width: 100%;
		.container{
			width: 1046px;
			padding: 24px 20px 20px;
			height: 638px;
			overflow: auto;
			background: #FFFFFF;
			float: left;
			margin-left: 20px;
			box-shadow: 1px 4px 7px 2px rgba(84, 137, 200, 0.09);
			border-radius: 10px;
			.header{
				.line{
					display: inline-block;
					width: 100%;
					height: 4px;
					background: #00489E;
					border-radius: 1px;
				}
			}
			.content{
				height: 516px;
				overflow-y: auto;
				.item_header{
					width: 780px;
					display: flex;
					justify-content: space-between;
					margin-top: 28px;
					padding-bottom: 10px;
					border-bottom: 2px solid #00489e;
					>span{
						position: relative;
						top: 10px;
					}
					.handler_btn{
						width: 80px;
						height: 32px;
						background: #FFFFFF;
						border: 1px solid #00489E;
						border-radius: 2px;
						line-height: 32px;
						color: #00489E;
					}
					/deep/ .el-button{
						padding: 0;
					}
				}
				.item_content{
					margin-top: 24px;
					span{
						padding-right: 15px;
						
						&:last-of-type{
							padding-left: 15px;
						}
					}
					/deep/ .el-input__inner{
						height: 32px;
						line-height: 32px;
					}
					/deep/ .el-input__icon{
						line-height: 32px !important;
					}
				}
				.item_contents{
					margin-top: 24px;
					width: 780px;
					>div{
						display: flex;
						justify-content: space-between;
						height: 36px;
						margin-bottom: 12px;
						background: #F4F7FC;
						align-items: center;
						.label{
							color: #50A6FF;
							display: inline-block;
							width: 500px;
							overflow:hidden;
							white-space:nowrap;
							text-overflow:ellipsis;
							padding-left: 20px;
						}
						i{
							color: #FF5D4F;
							padding-right: 20px;
							cursor: pointer;
						}
					}
				}
				.abolish_content{
					width: 780px;
					.abolish_item{
						height: 80px;
						background: #F4F7FC;
						margin-top: 15px;
						.label{
							line-height: 36px;
							padding-left: 20px;
							color: #51A7FF;
						}
						i{
							float: right;
							color: #FF5D4F;
							padding-right: 20px;
							cursor: pointer;
							padding-top: 16px;
						}
						div{
							span{
								padding-left: 20px;
								padding-right: 15px;
							}
							/deep/.el-input__inner{
								height: 32px;
								line-height: 32px;
							}
							/deep/ .el-input__icon{
								line-height: 32px !important;
							}
						}
					}
				}
			}
			.footer{
				position: relative;
				button{
					position: absolute;
					width: 80px;
					height: 32px;
					background: #00489E;
					border: 1px solid #00489E;
					border-radius: 2px;
					color: #fff;
					cursor: pointer;
					top: 20px;
				}
				.save{
					left: 350px;
				}
				.cancel{
					left: 550px;
					color: #00489E;
					background: #FFFFFF;
				}
			}
		}
	}
	.pop_header{
		height: 80px;
		width: 100%;
		background: #FFFFFF;
		position: relative;
		.query_info {
			display: inline-block;
			.query_item {
				display: inline-block;
				span {
					font-size: 14px;
					padding-left: 20px;
				}
		
				/deep/ .el-input__inner {
					height: 32px !important;
					line-height: 32px !important;
				}
		
				/deep/ .el-range-editor {
					padding: 0 10px;
					position: relative;
					top: 1px;
				}
		
				/deep/ .el-input__icon {
					line-height: 28px;
				}
			}
		}
		
		.search_query {
			width: 300px;
			margin-left: 10px;
			margin-top: 20px;
		}
		
		.search_btn {
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
	}
	.pop_content{
		margin-left: 20px;
		margin-right: 20px;
	}
	/deep/ .el-list-enter-active,
	/deep/ .el-list-move,
	/deep/ .el-list-leave-active {
	    transition: none;
	}
	
	/deep/ .el-list-enter,
	/deep/ .el-list-leave-active {
	    opacity: 0;
	}
	/deep/ .el-select-dropdown .el-pagination {
	    white-space: nowrap;
	    padding: 0;
	    color: #303133;
	    font-weight: 700;
	    width: 81%;
	    height: 31px;
	}
	.popup_content{
		height: 450px;
		overflow-y: auto;
		.content_item{
			height: 38px;
			line-height: 38px;
			padding-left: 20px;
			border-bottom: 1px solid #efefef;
			span{
				padding-left: 20px;
			}
		}
	}
	.popup_footer{
		margin-top: 15px;
		text-align: center;
		button{
			background: #00489E;
			border: 1px solid #00489E;
			border-radius: 2px;
			color: #fff;
		}
	}
</style>
