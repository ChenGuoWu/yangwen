<template>
	<div class="upload_file">
		<rule-survey></rule-survey>
		<div class="container">
			<div class="header">
				<span>规章内容</span>
				<span class="line"></span>
			</div>
			<div class="content">
				<span class="label">规章文件：</span>
				<div class="content_file">
					<div v-for="(item, index) in fileData" :key='index'>
						<span class="file_name">{{item.name}}</span>
						<span class="down" @click="toDown(item.url)">下载</span>
					</div>
				</div>
			</div>
			<div class="diagram">
				<div class="rule_num">
					<span>补充</span>
					<span style="background: #F4CC26;" class="number">{{supplementaryRulesList.length}}</span>
					<div class="rule_list" v-if="supplementaryRulesList.length > 0">
						<span v-for="(item, index) in supplementaryRulesList" @click="toDetail(item.ruleId)">{{item.ruleTitle}}</span>
					</div>
				</div>
				<img src="../../assets/img/zu.png" alt="">
				<div class="rule_num">
					<span>失效的技术规章</span>
					<span style="background: #F1561E;" class="number">{{disabledRulesList.length}}</span>
					<div class="rule_list" v-if="disabledRulesList.length > 0">
						<span v-for="(item, index) in disabledRulesList" @click="toDetail(item.ruleId)">{{item.ruleTitle}}</span>
					</div>
				</div>
				<div class="rule_num">
					<span>依据的技术规章</span>
					<span style="background: #42C054;" class="number">{{pursuantRulesList.length}}</span>
					<div class="rule_list" v-if="pursuantRulesList.length > 0">
						<span v-for="(item, index) in pursuantRulesList" @click="toDetail(item.ruleId)">{{item.ruleTitle}}</span>
					</div>
				</div>
				<img src="../../assets/img/jt2.png" alt="">
				<div>
					<span>本技术规章</span>
				</div>
				<img src="../../assets/img/jt3.png" alt="">
				<div class="rule_num">
					<span>下级技术规章</span>
					<span style="background: #46CEA6;" class="number">{{subordinateRulesList.length}}</span>
					<div class="rule_list" v-if="subordinateRulesList.length > 0">
						<span v-for="(item, index) in subordinateRulesList" @click="toDetail(item.ruleId)">{{item.ruleTitle}}</span>
					</div>
				</div>
				<img src="../../assets/img/jt1.png" alt="">
				<div class="rule_num">
					<span>补充</span>
					<span style="background: #F48826;" class="number">{{replenishRulesList.length}}</span>
					<div class="rule_list" v-if="replenishRulesList.length > 0">
						<span v-for="(item, index) in replenishRulesList" @click="toDetail(item.ruleId)">{{item.ruleTitle}}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import ruleSurvey from '../components/ruleSurvey.vue';
	export default{
		name: 'ruleFileDetail',
		components:{
			ruleSurvey
		},
		data(){
			return{
				fileData: [],
				disabledRulesList: [],   //失效的技术规章
				pursuantRulesList: [],   //依据的技术规章
				subordinateRulesList: [],  //下级技术规章
				supplementaryRulesList: [],  //补充的技术规章  左上
				replenishRulesList: [], //补充本身的技术规章  
			}
		},
		created() {
			this.init();
		},
		methods:{
			//初始化数据
			init(){
				let data = new FormData();
				data.append('ruleId', this.$route.query.id);
				this.$http.post('/rule/associated/selectRelationByRuleId', data).then(res => {
					if(res.code == '1'){
						this.disabledRulesList = [...res.data.disabledRulesList];
						this.pursuantRulesList = [...res.data.pursuantRulesList];
						this.replenishRulesList = [...res.data.supplementaryRulesList];
						this.subordinateRulesList = [...res.data.subordinateRulesList];
						this.supplementaryRulesList = [...res.data.replenishRulesList];
						Object.keys(res.data).forEach(key => {
							if(res.data[key].length > 0){
								res.data[key].forEach(item => {
									if(item.ruleFIleName && item.ruleFIleName.length > 0){
										item.ruleFIleName.forEach((items, index) => {
											this.fileData.push({
												url: item.ruleFileUrl[index],
												name: items
											})
										})
									}
								})
							}
						})
					}
				}).catch(err => {
					console.log(err);
				})
			},
			//跳转到详情页
			toDetail(id){
				let newPage = this.$router.resolve({path: '/titleMaintenance/ruleFileDetail', query: {id: id}});
				window.open(newPage.href,'_blank')
			},
			//去下载
			toDown(url){
				window.open(url);
			}
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
				height: 140px;
				overflow-y: auto;
				position: relative;
				justify-content: center;
				display: flex;
				border-bottom: 4px solid #00489E;
				.label{
					padding-top: 12px;
				}
				.content_file{
					margin-top: 12px;
					display: inline-block;
					.file_name{
						margin-right: 5px;
						color: #2084F2;
						text-decoration: underline;
						margin-bottom: 15px;
						cursor: pointer;
					}
					.down{
						cursor: pointer;
						color: #00489E;
					}
				}
			}
			.diagram{
				position: relative;
				div{
					width: 240px;
					height: 60px;
					background-color: #f2f6fa;
					border-radius: 10px;
					display: flex;
					justify-content: space-between;
					align-items: center;
					position: absolute;
					span:first-of-type{
						padding-left: 20px;
					}
					&:first-of-type{
						left: 106px;
						top: 40px;
					}
					&:nth-of-type(2){
						left: 106px;
						top: 150px;
					}
					&:nth-of-type(3){
						left: 420px;
						top: 40px;
					}
					&:nth-of-type(4){
						left: 420px;
						top: 150px;
						justify-content: center;
					}
					&:nth-of-type(5){
						left: 420px;
						top: 255px;
					}
					&:nth-of-type(6){
						left: 730px;
						top: 150px;
					}
					.number{
						color: #ffffff;
						width: 39px;
						height: 39px;
						line-height: 39px;
						text-align: center;
						margin-right: 22px;
						border-radius: 10px;
					}
				}
				img:first-of-type{
					position: absolute;
					left: 346px;
					top: 60px;
				}
				img:nth-of-type(2){
					position: absolute;
					left: 526px;
					top: 105px;
				}
				img:nth-of-type(3){
					position: absolute;
					left: 526px;
					top: 210px;
				}
				img:nth-of-type(4){
					position: absolute;
					left: 660px;
					top: 170px;
				}
			}
		}
	}
	.rule_num{
		.rule_list{
			width: 200px;
			height: 200px !important;
			overflow-y: auto;
			display: none !important;
			span{
				line-height: 36px !important;
				color: #2084F2;
				cursor: pointer;
				display: block;
				padding-left: 20px;
			}
		}
	}
	.rule_num:hover{
		.rule_list{
			display: block !important;
		}
	}
	.rule_num:first-of-type{
		.rule_list{
			left: 0 !important;
			top: -202px !important;
		}
	}
	.rule_num:nth-of-type(2){
		.rule_list{
			left: 0 !important;
			top: 62px !important;
		}
	}
	.rule_num:nth-of-type(3){
		.rule_list{
			left: 0 !important;
			top: -202px !important;
		}
	}
	.rule_num:nth-of-type(5){
		.rule_list{
			left: 0 !important;
			top: 62px !important;
		}
	}
	.rule_num:nth-of-type(6){
		.rule_list{
			left: 0 !important;
			top: 62px !important;
		}
	}
</style>
