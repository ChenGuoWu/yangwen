<template>
  <div class="successdetail">
    <div class="header">
      <div class="header_title">
        <div class="header_content">{{ showForm.solicitationTitle }}</div>
        <div class="header_phone">联系方式: {{ showForm.submitterCall }}</div>
        <div class="header_people">联系人: {{ showForm.submitter }}</div>
      </div>
      <div class="contents">
        {{ showForm.opinionContent }}
      </div>
      <div class="pdfs">
        <div
          class="pdfs_content"
          v-for="(item, index) in showForm.files"
          :key="index"
          @click="opens(item[1])"
        >
          {{ item[0] }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "opiniondetails",
  data() {
    return {
      showForm: [],
    };
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      let value = JSON.parse(this.$route.query.row);
      this.showForm = value;
      if (value["originalName"]) {
            let titlelist = value["originalName"].split(",");
      let lookPathList = value["opinionFilepath"].split(",");
      //将两个数组组合
      this.showForm.files = titlelist.map((o, i) => [o, lookPathList[i]]);
      }
    
    },
  },
};
</script>
<style lang="scss" scoped>
.successdetail {
  width: 100%;
  height: 680px;
  background: #ffffff;

  .header {
    height: 680px;
    width: 100%;
    background: #ffffff;
    box-shadow: 0px 4px 7px 1px rgba(84, 137, 199, 0.09);
    border-radius: 10px;
    position: relative;
    overflow: hidden;
    .header_title {
      height: 32px;
      margin: 20px;
      margin-bottom: 0;
      border-bottom: 4px solid #00479d;
      line-height: 36px;
      .header_content {
        font-size: 18px;
        font-family: "MicrosoftYaHei-Bold";
        font-weight: bolder;
        color: #333333;
        float: left;
      }
      .header_people {
        font-family: "MicrosoftYaHei";
        color: #333333;
        float: right;
      }
      .header_phone {
        font-family: "MicrosoftYaHei";
        color: #333333;
        float: right;
        margin-left: 40px;
      }
    }
    .contents {
      height: 500px;
      overflow-y: auto;
      margin: 20px;
    }
    .pdfs {
      height: 60px;
      background: #f4f7fc;
      margin: 20px;
      border-bottom: 2px solid #004fac;
      color: #0076ff;
      line-height: 30px;
      font-size: 16px;
      overflow-y: auto;
      .pdfs_content {
        margin-left: 20px;
        text-decoration: underline;
        cursor: pointer;
      }
    }
  }
}
</style>