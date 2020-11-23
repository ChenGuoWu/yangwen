<template>
  <div class="organization">
    <div class="one_level">
      <div class="header">
        <div class="header_title">
          <div class="header_content">{{showForm.solicitationTitle}}</div>
          <button class="history_btn">编辑历史</button>
          <button class="exports_btn">导出</button>
        </div>
        <div class="contents">
          <div class="contents_title">各铁路局公司</div>
          <div class="contents_content">{{showForm.solicitationDetails}}</div>
          <div class="contents_phone">
            <div>联系人: {{showForm.submitter}} {{showForm.submitterCall}}</div>
          </div>
          <div class="contents_time">
            <div>{{showForm.solicitationTime}}</div>
          </div>
        </div>
        <div class="pdfs">
          <div class="pdfs_content" v-for="(item,index) in showForm.files" :key="index" @click="opens(item[1])">{{item[0]}}</div>
        </div>
      </div>
      <div class="table_content" v-loading="loading">
        <div class="table_box">
          <el-table
            height="100%"
            :header-cell-style="{
              background: '#E1E8F4',
              color: '#333333',
              fontWeight: 'bold',
            }"
            :data="tableData"
            :cell-style="{ padding: '0' }"
            :row-style="{ height: '0.40rem' }"
            style="width: 100%; margin-bottom: 0.4rem"
            :cell-class-name="powerClass"
            :header-cell-class-name="headerpowerClass"
          >
            <el-table-column align="center" type="selection" width="60">
            </el-table-column>
            <el-table-column
              type="index"
              label="序号"
              min-width="15%"
              align="center"
            >
            </el-table-column>
            <el-table-column
              :show-overflow-tooltip="true"
              prop="opinionContent"
              label="意见"
              min-width="45%"
            >
            </el-table-column>

            <el-table-column
              prop="submissionTime"
              label="时间"
              min-width="15%"
            >
            </el-table-column>
            <el-table-column
              :show-overflow-tooltip="true"
              prop="submitter"
              label="联系人"
              min-width="15%"

            >
            </el-table-column>
            <el-table-column align="center" label="操作" width="100">
              <template slot-scope="scope">
                <el-button
                  style="padding: 0 0.2rem; color: #00479d"
                  @click="view(scope.row)"
                  type="text"
                  size="small"
                  >查看</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </div>
        <el-pagination
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="page"
          :page-sizes="pageSizes"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        >
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "viewcommentdetails",
  data() {
    return {
      tableData: [], //表格数据
      loading: false, //是否显示loading
      pageSizes: [10, 15, 20, 25, 30], //可选择显示条数
      pageSize: 10, //每页显示条数，默认为10
      page: 1, //当前页数，默认为1
      total: 0, //数据总条数
      queryForm: {
        //查询表单
        solicitationId: "",
      },
      showForm:[],
    };
  },
  created() {
    this.init();
  },
  mounted() {
    document.getElementsByClassName("router_box")[0].style.height = "11rem";
    document.getElementsByClassName("container")[0].style.height = "11.40rem";
  },
  beforeDestroy() {
    document.getElementsByClassName("router_box")[0].style.height = "7.10rem";
    document.getElementsByClassName("container")[0].style.height = "8.30rem";
  },
  methods: {
    //初始化数据
    init() {
      let solicitationId = JSON.parse(this.$route.query.row).id;
      //如果存在数据则发送请求
      if (solicitationId) {
          this.queryForm.solicitationId=solicitationId;
        this.loading = true;
        let data = {
          ...this.queryForm,
          pageIndex: this.page,
          pageSize: this.pageSize,
        };
        this.$http
          .get("/rule/opinion/getOpinionBySolicitationId", data)
          .then((res) => {
            this.loading = false;
            if (res.code == "1") {
              this.showForm=res.data;
              let titlelist = res.data["originalName"].split(",");
              let lookPathList = res.data["solicitationFilepath"].split(",");
              //将两个数组组合
              this.showForm.files=titlelist.map((o,i)=>[o,lookPathList[i]]);
              this.tableData = res.dataTwo;
              this.total = res.pageInfo.total;
            } else {
              this.total = 0;
              this.tableData = [];
              this.$message.error(res.msg);
            }
          })
          .catch((err) => {
            this.loading = false;
            console.log(err);
          });
      }
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
    //状态的样式
    powerClass(row) {
      if (row.columnIndex == 5) {
        return "addcssborder";
      }
    },
    //状态表头对应的样式
    headerpowerClass(row) {
      if (row.columnIndex == 5) {
        return "addcssborder";
      }
    },
    //点击文件打开
    opens(val){
        window.open(val)
    },
    //查看跳转页面
    view(row){
         //跳转至查询页面
       this.$store.dispatch("changeIsAddRoute", true);
      this.$router.push({
        name: "Opiniondetails",
        query: {
          row: JSON.stringify(row),
        },
      });
    }
  },
};
</script>

<style scoped="scoped" lang="scss">
.one_level {
  .header {
    height: 460px;
    width: 100%;
    background: #ffffff;
    box-shadow: 0px 4px 7px 1px rgba(84, 137, 199, 0.09);
    border-radius: 10px;
    position: relative;
    overflow: hidden;
    .header_title {
      height: 32px;
      margin: 20px;
      border-bottom: 4px solid #00479d;
      font-family: 'MicrosoftYaHei-Bold';
      font-weight: bolder;
      .header_content {
        font-size: 16px;
        line-height: 32px;
        color: #333333;
        float: left;
      }
      .exports_btn {
        width: 80px;
        height: 32px;
        background: #00479d;
        color: white;
        margin-top: -5px;
        margin-right: 20px;
        border-radius: 4px;
        border: 1px solid #00479d;
        line-height: 32px;
        float: right;
      }
      .history_btn {
        background: #ffffff;
        width: 80px;
        height: 32px;
        margin-top: -5px;
        color: #00479d;
        border-radius: 4px;
        border: 1px solid #00479d;
        line-height: 32px;
        float: right;
      }
    }
    .contents {
      margin: 20px;
      height: 280px;
      overflow-y: auto;
      .contents_title {
        margin: 20px;
      }
      .contents_content {
        margin: 20px;
      }
      .contents_phone {
        margin: 20px;
        height: 24px;
        div {
          float: right;
        }
      }
      .contents_time {
        margin: 20px;
        height: 24px;
        div {
          float: right;
        }
      }
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
        text-decoration:underline ;
        cursor: pointer;
      }
    }
  }
}
.table_content {
  height: 549px;
  padding: 20px;
  background: #ffffff;
  box-shadow: 0px 4px 7px 1px rgba(84, 137, 199, 0.09);
  border-radius: 10px;
  margin-top: 20px;
}

.is_required {
  /deep/ .el-form-item__label {
    padding-left: 10px !important;
    &::before {
      content: "*";
      color: #f56c6c;
      margin-right: 4px;
    }
  }
  /deep/ .el-form-item__content {
    height: 354px;
    overflow-y: auto;
  }
  .required {
    color: #f56c6c;
    position: relative;
    top: -37px;
  }
}
.super {
  margin-left: 20px;
}
/deep/ .addcss {
  text-align: center !important;
}
/deep/ .addcsscenter {
  text-align: center !important;
  border-left: 1px solid #e1e8f4 !important;
}
/deep/ .addcssborder {
  border-left: 1px solid #e1e8f4 !important;
}

.file {
  width: 500px;
  height: 70px;
}
.file .upload-demo {
  display: flex;
  width: 100%;
  height: 60px;
  margin-left: 50px;
  justify-content: space-between;
  /deep/ .el-upload-list {
    overflow-y: auto !important;
    width: 300px !important;
    height: 60px !important;
    margin-top: -20px;
  }
}
.clickfile {
  color: #00479d;
  height: 20px;
  line-height: 5px;
  border: 1px solid #00479d;
}
.divider {
  width: 520px;
  margin: -20px 0 0 40px;
}
.formpower {
  margin-left: -30px;
  .el-radio {
    margin-left: 20px;
  }
}
/deep/ .router_box {
  height: 1080px !important;
}
</style>
