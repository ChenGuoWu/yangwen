<template>
	<div class="organization">
		<div class="one_level">
			<div class="header">
				<div class="query_info">
					<div class="query_item">
						<span>反馈类型</span>
						<el-select clearable class="search_query width_2rem" placeholder="请选择反馈类型" v-model="queryForm.feedbackType">
							<el-option v-for="item in feedbackTypeList" :key="item.value" :label="item.label" :value="item.value"></el-option>
						</el-select>
					</div>
					<div class="query_item">
						<span>提交时间</span>
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
						<span>提交人</span>
						<el-input v-model="queryForm.submitter" placeholder="请输入提交人" class="search_query width_2rem"></el-input>
					</div>
				</div>
				<button class="search_btn" @click="init">查询</button>
				<button class="search_btn" @click="resizeQuery">重置</button>
			</div>
			<div class="table_content" v-loading="loading">
				<div class="table_box">
					<el-table height="100%" :header-cell-style="{background:'#E1E8F4',color:'#333333',fontWeight:'bold'}" :data="tableData" :cell-style="{padding: '0'}" :row-style="{height: '0.4rem'}" style="width: 100%; margin-bottom: 0.4rem;">
						<el-table-column type="index" label="序号" width="55" align="center">
						</el-table-column>
						<el-table-column :show-overflow-tooltip="true" prop="feedbackType" label="反馈类型" width="270">
							<template slot-scope="scope">
								<span>{{scope.row.feedbackType == 1 ? '规章问题' : '系统问题'}}</span>
							</template>
						</el-table-column>
						<el-table-column :show-overflow-tooltip="true" prop="problem" label="问题" width="320">
						</el-table-column>
						<el-table-column :show-overflow-tooltip="true" prop="problemDetails" label="问题详情" width="420">
						</el-table-column>
						<el-table-column :show-overflow-tooltip="true" prop="submitter" label="提交人" width="100">
						</el-table-column>
						<el-table-column prop="submissionTime" label="提交时间" width="220">
						</el-table-column>
						<el-table-column align="center" label="操作">
							<template slot-scope="scope">
								<el-button style="padding: 0 0.3rem;" @click="viewData(scope.row)" type="text" size="small">查看</el-button>
							</template>
						</el-table-column>
					</el-table>
				</div>
				<el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="page"
				 :page-sizes="pageSizes" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
				</el-pagination>
			</div>
		</div>
		<popup :popupHeight="6" :readOnly="true" v-loading="popupLoading" v-if="showPopup" :show='showPopup' :title="popupTitle">
			<div class="popup_item">
				<span>反馈类型</span>
				<span>{{addForm.feedbackType == 1 ? '规章问题' : '系统问题'}}</span>
			</div>
			<div class="popup_item">
				<span>问题</span>
				<span>{{addForm.problem}}</span>
			</div>
			<div class="popup_item">
				<span>提交人</span>
				<span>{{addForm.submitter}}</span>
			</div>
			<div class="popup_item">
				<span>提交时间</span>
				<span>{{addForm.submissionTime}}</span>
			</div>
			<div class="popup_item">
				<span>问题详情</span>
				<span>{{addForm.problemDetails}}</span>
			</div>
		</popup>
	</div>
</template>

<script>
	import popup from '../components/popup.vue';
	export default {
		name: 'feedback',
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
				popupTitle: '详情', //弹窗标题
				popupLoading: false,  //弹窗loading
				queryForm: {  //查询表单
					feedbackType: '',
					startTime: '',
					endTime: '',
					pubTime: '',
					submitter: ''
				},
				feedbackTypeList: [{   //问题反馈类型
					label: '规章问题',
					value: 1
				},{
					label: '系统问题',
					value: 0
				}],
				addForm: {
					feedbackType: '',
					submitter: '',
					submissionTime: '',
					problem: '',
					problemDetails: ''
				},
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
				this.$http.get('/rule/feedback/getRuleFeedbackByCondition', data).then(res => {
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
			//编辑数据
			viewData(row){
				this.popupTitle = '详情';
				Object.keys(this.addForm).forEach(key => {
					this.addForm[key] = row[key];
				})
				this.showPopup = true;
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
	.popup_item{
		margin-left: 20px;
		margin-top: 20px;
		display: flex;
		justify-content: space-between;
		span{
			&:first-of-type{
				font-weight: bold;
				color: #343434;
				line-height: 28px;
				width: 80px;
			}
			&:last-of-type{
				width: 340px;
				margin-right: 30px;
			}
		}
		&:nth-of-type(2){
			span:last-of-type{
				overflow : hidden;
				text-overflow: ellipsis;
				display: -webkit-box;
				-webkit-line-clamp: 2;
				-webkit-box-orient: vertical;
			}
		}
		&:last-of-type{
			span:last-of-type{
				height: 300px;
				overflow-y: auto;
			}
		}
	}
</style>
