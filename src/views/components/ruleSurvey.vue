<template>
	<div class="rule_survey">
		<div class="header">
			<span>规章概况</span>
			<img v-if="ruleInfo.ruleExpStatus == 'DIC-0019'" src="../../assets/img/waitTakeEffect.png" alt="">
			<img v-if="ruleInfo.ruleExpStatus == 'DIC-0020'" src="../../assets/img/takeEffect.png" alt="">
			<img v-if="ruleInfo.ruleExpStatus == 'DIC-0021'" src="../../assets/img/waitInvalid.png" alt="">
			<img v-if="ruleInfo.ruleExpStatus == 'DIC-0022'" src="../../assets/img/invalid.png" alt="">
			<span class="line"></span>
		</div>
		<div class="content">
			<div class="item">
				<span class="label">【规章名称】</span>
				<span class="value">{{ruleInfo.ruleTitle}}</span>
			</div>
			<div class="item">
				<span class="label">【发文文号】</span>
				<span class="value">{{ruleInfo.ruleDocNo}}</span>
			</div>
			<div class="item">
				<span class="label">【负责部门】</span>
				<span class="value">{{ruleInfo.deptInCharge}}</span>
			</div>
			<div class="item">
				<span class="label">【规章编号】</span>
				<span class="value">{{ruleInfo.ruleNo}}</span>
			</div>
			<div class="item">
				<span class="label">【专<span style="display: inline-block; width: 0.32rem;"></span>业】</span>
				<span class="value">{{ruleInfo.ruleDomainName}}</span>
			</div>
			<div class="item">
				<span class="label">【规章类别】</span>
				<span class="value">{{ruleInfo.ruleTypeName}}</span>
			</div>
			<div class="item">
				<span class="label">【发文时间】</span>
				<span class="value">{{ruleInfo.ruleIssueDate}}</span>
			</div>
			<div class="item">
				<span class="label">【施行时间】</span>
				<span class="value">{{ruleInfo.ruleImplDate}}</span>
			</div>
			<div class="item">
				<span class="label">【适用范围】</span>
				<span class="value">{{ruleInfo.ruleAppScopeName}}</span>
			</div>
		</div>
	</div>
</template>

<script>
	export default{
		data(){
			return {
				ruleInfo: {},  //规章信息
				ruleId: '', //规章id
				majorList: [],   //专业
				rulesList: [],   //规章类别
				scopeOfApplicationList: [],  //适用范围
			}
		},
		created() {
			this.ruleId = this.$route.query.id;
			this.getMajorList();
			this.getRulesType();
			this.getScopeOfApplication();
			this.init();
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
						this.majorList.forEach(item => {
							if(item.dicCode == this.ruleInfo.ruleDomain){
								this.ruleInfo.ruleDomainName = item.dicName;
							}
						})
						this.rulesList.forEach(item => {
							if(item.dicCode == this.ruleInfo.ruleType){
								this.ruleInfo.ruleTypeName = item.dicName;
							}
						})
						this.scopeOfApplicationList.forEach(item => {
							if(item.dicCode == this.ruleInfo.ruleAppScope){
								this.ruleInfo.ruleAppScopeName = item.dicName;
							}
						})
					} else {
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
			//获取规章类别List
			getRulesType(){
				let data = new FormData();
				data.append('dicType', 2);
				this.$http.post('/rule/dataDic/getDataDicByType', data, {
					headers: {
						"Content-Type": "application/x-www-form-urlencoded"
					}
				}).then(res => {
					if(res.code == '1'){
						this.rulesList = res.data;
					}else{
						this.$message.error(msg);
					}
				}).catch(err => {
					console.log(err);
				})
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
			}
		},
	}
</script>

<style lang="scss" scoped="scoped">
	.rule_survey{
		width: 402px;
		height: 658px;
		padding-top: 24px;
		padding-left: 12px;
		background: #FFFFFF;
		box-shadow: 0px 4px 7px 1px rgba(84, 137, 199, 0.09);
		border-radius: 10px;
		float: left;
		position: relative;
		.header{
			margin-left: 8px;
			.line{
				display: inline-block;
				width: 376px;
				height: 4px;
				background: #00489E;
				border-radius: 1px;
			}
			img{
				position: absolute;
				right: 0;
				top: 0;
			}
		}
		.content{
			.item{
				margin-top: 30px;
				display: flex;
				align-items: center;
				.label{
					color: #760027;
				}
				.value{
					display: inline-block;
					width: 287px;
					overflow: hidden;
					white-space: nowrap;
					text-overflow: ellipsis;
				}
			}
		}
	}
</style>
