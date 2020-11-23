import Vue from 'vue'
import VueRouter from 'vue-router'
const Home = () => import( '../views/Home.vue');

//  系统管理
const Organization = () => import('../views/systemManage/organization.vue');
const RuleClassification = () => import('../views/systemManage/ruleClassification.vue');
const UserAauthority = () => import('../views/systemManage/userAauthority.vue');
const UserManage = () => import('../views/systemManage/userManage.vue');
const AboutLink = () => import('../views/systemManage/aboutLink.vue');
const LawsAndRegulations = () => import('../views/systemManage/lawsAndRegulations.vue');
const Notice = () => import('../views/systemManage/notice.vue');
const AboutNews = () => import('../views/systemManage/aboutNews.vue');
const Feedback = () => import('../views/systemManage/feedback.vue');
const Logquery = () => import('../views/systemManage/logquery.vue');
const Dictionary = () => import('../views/systemManage/dictionary.vue');
const Managementofthekeyvalue = () => import('../views/systemManage/managementofthekeyvalue.vue');
const Managementmethod = () => import('../views/systemManage/managementinformation/managementmethod.vue');
const Personnelmaintenance = () => import('../views/systemManage/managementinformation/personnelmaintenance.vue');
const Revisionplanmaintenance = () => import('../views/systemManage/managementinformation/revisionplanmaintenance.vue');


//  文件维护
const FileUpload = () => import('../views/fileMaintain/fileUpload.vue');
const UploadFile = () => import('../views/fileMaintain/uploadFile.vue');
const FileOverview = () => import('../views/fileMaintain/fileOverview.vue');


//  标题管理
const AddTitle = () => import('../views/titleMaintenance/addTitle.vue');
const TitleOverview = () => import('../views/titleMaintenance/titleOverview.vue');
const RuleFileDetail = () => import('../views/titleMaintenance/ruleFileDetail.vue');


//  失效管理
const InvalidApply = () => import('../views/invalidMaintenance/invalidApply.vue');
const InvalidVerify = () => import('../views/invalidMaintenance/invalidVerify.vue');


//  制修订集合管理
const RevisionPlanCensus = () => import('../views/revisionPlanManage/revisionPlanCensus.vue');
const RevisionPlanPut = () => import('../views/revisionPlanManage/revisionPlanPut.vue');
const RevisionPlanVerify = () => import('../views/revisionPlanManage/revisionPlanVerify.vue');
const RevisionPlanVerifyDetail = () => import('../views/revisionPlanManage/revisionPlanVerifyDetail.vue');
const RevisionPlanPutDetail = () => import('../views/revisionPlanManage/revisionPlanPutDetail.vue');
const RevisionPlanPutAdd = () => import('../views/revisionPlanManage/revisionPlanPutAdd.vue');

//意见征求
const Solicitingopinions = () => import('../views/soliciting/solicitingopinions.vue');
const Editsolicitingopinions = () => import('../views/soliciting/editsolicitingopinions.vue');
const Viewcommentdetails = () => import('../views/soliciting/viewcommentdetails.vue');
const Opiniondetails = () => import('../views/soliciting/opiniondetails.vue');

//管理部门
const Managementdepartment = () => import('../views/managementdepartment/managementdepartment.vue');

//站细段细
const Stationdetailedmaintenance = () => import('../views/stationdetails/stationdetailedmaintenance.vue');

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
	children: [
	  {
		path: '/systemManage/organization',
		name: 'Organization',
		component: Organization
	  },
	  {
		path: '/systemManage/ruleClassification',
		name: 'RuleClassification',
		component: RuleClassification
	  },
	  {
		path: '/systemManage/userAauthority',
		name: 'UserAauthority',
		component: UserAauthority
	  },
	  {
		path: '/systemManage/userManage',
		name: 'UserManage',
		component: UserManage
	  },
	  {
		path: '/systemManage/aboutLink',
		name: 'AboutLink',
		component: AboutLink
	  },
	  {
		path: '/systemManage/lawsAndRegulations',
		name: 'LawsAndRegulations',
		component: LawsAndRegulations
	  },
	  {
		path: '/systemManage/notice',
		name: 'Notice',
		component: Notice
	  },
	  {
		path: '/systemManage/aboutNews',
		name: 'AboutNews',
		component: AboutNews
	  },
	  {
		path: '/systemManage/feedback',
		name: 'Feedback',
		component: Feedback
	  },
	  {
		path: '/systemManage/logquery',
		name: 'Logquery',
		component: Logquery
	  },
	  {
		path: '/systemManage/dictionary',
		name: 'Dictionary',
		component: Dictionary
	  },
	  {
		path: '/systemManage/managementofthekeyvalue',
		name: 'Managementofthekeyvalue',
		component: Managementofthekeyvalue
	  },
	  {
		path: '/systemManage/managementinformation/managementmethod',
		name: 'Managementmethod',
		component: Managementmethod,
	  },
	  {
		path: '/systemManage/managementinformation/personnelmaintenance',
		name: 'Personnelmaintenance',
		component: Personnelmaintenance,
	  },
	  {
		path: '/systemManage/managementinformation/revisionplanmaintenance',
		name: 'Revisionplanmaintenance',
		component: Revisionplanmaintenance,
	  },
	  {
		path: '/titleMaintenance/addTitle',
		name: 'AddTitle',
		component: AddTitle
	  },
	  {
		path: '/titleMaintenance/titleOverview',
		name: 'TitleOverview',
		component: TitleOverview
	  },
	  {
		path: '/titleMaintenance/ruleFileDetail',
		name: 'RuleFileDetail',
		component: RuleFileDetail
	  },
	  {
		path: '/fileMaintain/fileUpload',
		name: 'FileUpload',
		component: FileUpload
	  },
	  {
		path: '/fileMaintain/fileOverview',
		name: 'FileOverview',
		component: FileOverview
	  },
	  {
		path: '/fileMaintain/uploadFile',
		name: 'UploadFile',
		component: UploadFile
	  },
	  {
		path: '/invalidMaintain/invalidApply',
		name: 'InvalidApply',
		component: InvalidApply
	  },
	  {
		path: '/invalidMaintain/invalidVerify',
		name: 'InvalidVerify',
		component: InvalidVerify
	  },
	  {
		path: '/revisionPlanManage/revisionPlanPut',
		name: 'RevisionPlanPut',
		component: RevisionPlanPut
	  },
	  {
		path: '/revisionPlanManage/revisionPlanPutAdd',
		name: 'RevisionPlanPutAdd',
		component: RevisionPlanPutAdd
	  },
	  {
		path: '/revisionPlanManage/revisionPlanVerify',
		name: 'RevisionPlanVerify',
		component: RevisionPlanVerify
	  },
	  {
		path: '/revisionPlanManage/revisionPlanVerifyDetail',
		name: 'RevisionPlanVerifyDetail',
		component: RevisionPlanVerifyDetail
	  },
	  {
		path: '/revisionPlanManage/revisionPlanCensus',
		name: 'RevisionPlanCensus',
		component: RevisionPlanCensus
	  },
	  {
		path: '/revisionPlanManage/revisionPlanPutDetail',
		name: 'RevisionPlanPutDetail',
		component: RevisionPlanPutDetail
	  },
	  {
		path: '/soliciting/solicitingopinions',
		name: 'Solicitingopinions',
		component: Solicitingopinions
	  },
	  {
		path: '/soliciting/editsolicitingopinions',
		name: 'Editsolicitingopinions',
		component: Editsolicitingopinions
	  },
	  {
		path: '/soliciting/viewcommentdetails',
		name: 'Viewcommentdetails',
		component: Viewcommentdetails
	  },
	  {
		path: '/soliciting/opiniondetails',
		name: 'Opiniondetails',
		component: Opiniondetails
	  },
	  {
		path: '/managementdepartment/managementdepartment',
		name: 'Managementdepartment',
		component: Managementdepartment
	  },
	  {
		path: '/stationdetails/stationdetailedmaintenance',
		name: 'Stationdetailedmaintenance',
		component: Stationdetailedmaintenance
	  },
	]
  },
  
]

const originalPush = VueRouter.prototype.push
   VueRouter.prototype.push = function push(location) {
   return originalPush.call(this, location).catch(err => err)
}

const router = new VueRouter({
  routes
})

export default router
