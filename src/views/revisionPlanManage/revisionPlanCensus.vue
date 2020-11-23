<template>
	<div class="census">
		<div class="one_level">
			<div class="header">
				<div class="query_info">
					<div class="query_item" v-if="userRole == '1'">
						<span>单位</span>
						<el-select class="search_query width_2rem" @change="changeOrg" v-model="queryForm.selectWorkUnits" clearable>
							<el-option v-for="(item, index) in orgnizationList" :label="item.unitName" :value="item.id" :key="item.id"></el-option>
						</el-select>
					</div>
					<div class="query_item">
						<span>制修订名称</span>
						<el-select v-model="queryForm.revisionId" filterable class="search_query width_2rem">
							<el-option v-for="(item, index) in revisionPlanList" :label="item.revisionName" :value="item.id" :key="item.id"></el-option>
						</el-select>
					</div>
				</div>
				<button class="search_btn" @click="init">查询</button>
			</div>
			<div class="table_content" v-loading='echartsLoading'>
				<div class="echarts1" ref="echarts1"></div>
				<div class="echarts2" ref="echarts2"></div>
				<div class="echarts3" ref="echarts3"></div>
			</div>
		</div>
	</div>
</template>

<script>
	export default{
		data(){
			return {
				queryForm: {
					selectWorkUnits: '',
					revisionId: ''
				},
				orgnizationList: [],  //一级组织机构
				revisionPlanList: [],  //制修订列表
				userRole: '',  //用户权限
				echartsLoading: false,
			}
		},
		created() {
			if(JSON.parse(sessionStorage.getItem('userInfo')).userRole == 1){
				this.userRole = 1;
				this.$http.post('/rule/unit/getRuleUnitListByParentId', {
						id: 0
					}).then(res => {
					if (res.code == '1') {
						this.orgnizationList= res.data;
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
		},
		methods:{
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
						if(!res.data || res.data.length == 0) delete this.queryForm.revisionId;
						this.queryForm.revisionId = res.data[0].id;
						this.init();
					} else {
						this.revisionPlanList = [];
						if(!res.data || res.data.length == 0) delete this.queryForm.revisionId;
						this.$message.error(res.msg);
					}
				}).catch(err => {
					console.log(err);
				})
			},
			//初始化图表数据
			init(){
				this.echartsLoading = true;
				let data = {
					workUnits: this.queryForm.selectWorkUnits,
					revisionId: this.queryForm.revisionId
				};
				this.$http.post('/rule/revisionSubmitReports/dataStatistics', data).then(res => {
					if(res.code == '1'){
						let data1 = [];
						data1.push({
							name: '制订计划完成数量',
							value: res.data.formulateAccomplishNum
						});
						data1.push({
							name: '制订计划总数量',
							value: res.data.formulateSum
						});
						let data2 = [];
						data2.push({
							name: '修订计划完成数量',
							value: res.data.reviseAccomplishNum
						});
						data2.push({
							name: '修订计划总数量',
							value: res.data.formulateSum
						});
						let data3 = [];
						data3.push({
							name: '制修订计划完成数量',
							value: res.data.formulateAndReviseAccomplishNum
						});
						data3.push({
							name: '制修订计划总数量',
							value: res.data.formulateAndReviseSum
						});
						let myChart = this.$echarts.init(this.$refs['echarts1']);
							// 指定图表的配置项和数据
							var option = {
								tooltip: {
									trigger: 'item',
									formatter: '{a} <br/>{b}: {c} ({d}%)'
								},
								legend: {
									bottom: 10,
									data: ['制订计划完成数量', '制订计划总数量'],
								},
								title: {
									text: '制订完成率',
									textStyle: {
										color: '#00479D',
										fontWeight: 'bold',
										fontSize: '14',
									}
								},
								series: [
									{
										name: '制订完成率',
										type: 'pie',
										radius: ['50%', '70%'],
										avoidLabelOverlap: false,
										label: {
											show: true,
											formatter: '{b}: {c}',
											normal: {
												formatter(v) {
													let text = v.name;
													let value_format = v.value;
													if (text.length <= 6) {
													  return `${text}\n${value_format}`;
													} else if (text.length > 4 && text.length <= 12) {
													  return text = `${text.slice(0, 3)}\n${text.slice(3, 6)}\n${text.slice(7)}${value_format}`
													} else if (text.length > 12 && text.length <= 18) {
													  return text = `${text.slice(0, 3)}\n${text.slice(3, 6)}\n${text.slice(7, 10)}\n${text.slice(10)}${value_format}`
													}
												},
											}
										},
										itemStyle: {
											color(data) {
												if(data.data.name == '制订计划完成数量') return '#0263FF';
												if(data.data.name == '制订计划总数量') return '#FF9829';
											}
										},
										emphasis: {
											label: {
												show: true,
												fontSize: '14',
												length: 2,
												fontWeight: 'bold'
											}
										},
										labelLine: {
											show: true
										},
										data: data1
									}
								]
							};
							// 使用刚指定的配置项和数据显示图表。
							myChart.setOption(option);
						let myChart2 = this.$echarts.init(this.$refs['echarts2']);
							// 指定图表的配置项和数据
							var option = {
								tooltip: {
									trigger: 'item',
									formatter: '{a} <br/>{b}: {c} ({d}%)'
								},
								legend: {
									bottom: 10,
									data: ['修订计划完成数量', '修订计划总数量'],
								},
								title: {
									text: '修订完成率',
									textStyle: {
										color: '#00479D',
										fontWeight: 'bold',
										fontSize: '14',
									}
								},
								series: [
									{
										name: '修订完成率',
										type: 'pie',
										radius: ['50%', '70%'],
										avoidLabelOverlap: false,
										label: {
											show: true,
											formatter: '{b}: {c}',
											normal: {
												formatter(v) {
													let text = v.name;
													let value_format = v.value;
													if (text.length <= 6) {
													  return `${text}\n${value_format}`;
													} else if (text.length > 4 && text.length <= 12) {
													  return text = `${text.slice(0, 3)}\n${text.slice(3, 6)}\n${text.slice(7)}${value_format}`
													} else if (text.length > 12 && text.length <= 18) {
													  return text = `${text.slice(0, 3)}\n${text.slice(3, 6)}\n${text.slice(7, 10)}\n${text.slice(10)}${value_format}`
													}
												},
											}
										},
										itemStyle: {
											color(data) {
												if(data.data.name == '修订计划完成数量') return '#0263FF';
												if(data.data.name == '修订计划总数量') return '#FF9829';
											}
										},
										emphasis: {
											label: {
												show: true,
												fontSize: '14',
												length: 2,
												fontWeight: 'bold'
											}
										},
										labelLine: {
											show: true
										},
										data: data2
									}
								]
							};
							// 使用刚指定的配置项和数据显示图表。
							myChart2.setOption(option);
							let myChart3 = this.$echarts.init(this.$refs['echarts3']);
								// 指定图表的配置项和数据
								var option = {
									tooltip: {
										trigger: 'item',
										formatter: '{a} <br/>{b}: {c} ({d}%)'
									},
									legend: {
										bottom: 10,
										data: ['制修订计划完成数量', '制修订计划总数量'],
									},
									title: {
										text: '制修订完成率',
										textStyle: {
											color: '#00479D',
											fontWeight: 'bold',
											fontSize: '14',
										}
									},
									series: [
										{
											name: '制修订完成率',
											type: 'pie',
											radius: ['50%', '70%'],
											avoidLabelOverlap: false,
											label: {
												show: true,
												formatter: '{b}: {c}',
												normal: {
													formatter(v) {
														let text = v.name;
														let value_format = v.value;
														if (text.length <= 6) {
														  return `${text}\n${value_format}`;
														} else if (text.length > 4 && text.length <= 12) {
														  return text = `${text.slice(0, 3)}\n${text.slice(3, 6)}\n${text.slice(7)}${value_format}`
														} else if (text.length > 12 && text.length <= 18) {
														  return text = `${text.slice(0, 3)}\n${text.slice(3, 6)}\n${text.slice(7, 10)}\n${text.slice(10)}${value_format}`
														}
													},
												}
											},
											itemStyle: {
												color(data) {
													if(data.data.name == '制修订计划完成数量') return '#0263FF';
													if(data.data.name == '制修订计划总数量') return '#FF9829';
												}
											},
											emphasis: {
												label: {
													show: true,
													fontSize: '14',
													length: 2,
													fontWeight: 'bold'
												}
											},
											labelLine: {
												show: true
											},
											data: data3
										}
									]
								};
								// 使用刚指定的配置项和数据显示图表。
								myChart3.setOption(option);
					}
					this.echartsLoading = false;
				}).catch(err => {
					console.log(err);
				})
			},
			//修改单位获取不同的制修订
			changeOrg(val){
				this.getRevisionPlanList();
			}
		}
	}
</script>

<style lang="scss" scoped>
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
		}
	
		.table_content {
			height: 550px;
			padding: 20px;
			background: #FFFFFF;
			box-shadow: 0px 4px 7px 1px rgba(84, 137, 199, 0.09);
			border-radius: 10px;
			margin-top: 20px;
			display: flex;
			.echarts1, .echarts2, .echarts3{
				width: 484px;
				height: 547px;
				background: #FFFFFF;
				border: 1px solid #EEEEEE;
				border-radius: 4px;
				margin-right: 20px;
			}
		}
	}
</style>
