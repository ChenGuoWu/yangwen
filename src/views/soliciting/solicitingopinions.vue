<template>
  <div class="organization">
    <div class="one_level">
      <div class="header">
        <div class="query_info">
          <div class="query_item">
            <span>标题</span>
            <el-input
              v-model="queryForm.solicitationTitle"
              class="search_query width_2rem"
            ></el-input>
          </div>
          <div class="query_item">
            <span>发布时间</span>
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
              :picker-options="pickerOptions"
            >
            </el-date-picker>
          </div>
          <button class="add_btn" @click="addData">新增</button>
          <button class="exportes_btn" @click="exportes">数据导出</button>
          <button class="search_btn" @click="resizeQuery">重置</button>
          <button class="search_btn" @click="init">查询</button>
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
            <el-table-column align="center" type="selection" width="50">
            </el-table-column>
            <el-table-column
              type="index"
              label="序号"
              width="180"
              align="center"
            >
            </el-table-column>
            <el-table-column
              :show-overflow-tooltip="true"
              prop="solicitationTitle"
              label="标题"
              width="660"
            >
            </el-table-column>

            <el-table-column
              prop="solicitationTime"
              label="发文时间"
              width="200"
            >
            </el-table-column>
            <el-table-column
              :show-overflow-tooltip="true"
              prop="repliesNum"
              label="回复数量"
              width="160"
              align="center"
            >
            </el-table-column>
            <el-table-column align="center" label="操作" width="240">
              <template slot-scope="scope">
                <el-button
                  style="padding: 0 0.2rem; color: #00479d"
                  @click="view(scope.row)"
                  type="text"
                  size="small"
                  >查看</el-button
                >
                <el-button
                  style="padding: 0 0.2rem; color: #00479d"
                  @click="editData(scope.row)"
                  type="text"
                  size="small"
                  >编辑</el-button
                >
                <el-button
                  style="padding: 0 0.2rem; color: #ff3d3d"
                  @click="deleteData(scope.row)"
                  type="text"
                  size="small"
                  >删除</el-button
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
  name: "solicitingopinions",
  data() {
    return {
      userRole: "", //权限
      tableData: [], //表格数据
      loading: false, //是否显示loading
      pageSizes: [10, 15, 20, 25, 30], //可选择显示条数
      pageSize: 10, //每页显示条数，默认为10
      page: 1, //当前页数，默认为1
      total: 0, //数据总条数
      queryForm: {
        //查询表单
        solicitationTitle: "",
        startTime: "",
        endTime: "",
        pubTime: "",
      },
      editId: "", //修改数据id
      //一级组织机构id配置项
      workUnitsoption: [],
      //部门配置项
      departmentoption: [],

      pickerOptions: {
        shortcuts: [
          {
            text: "最近一周",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            },
          },
        ],
      },
      multipleSelection: [], //表格选中的数据
      uploadData: "", //上传数据
      fileList: [], //上传文件list
    };
  },
  created() {
    this.init();
  },
  mounted() {
    document.getElementsByClassName("router_box")[0].style.height = "7.58rem";
  },
  beforeDestroy() {
    document.getElementsByClassName("router_box")[0].style.height = "7.10rem";
  },
  methods: {
    //初始化数据
    init() {
      this.loading = true;
      let data = {
        ...this.queryForm,
        pageIndex: this.page,
        pageSize: this.pageSize,
      };
      if (data.pubTime) {
        data.startTime = data.pubTime[0];
        data.endTime = data.pubTime[1] + " 23:59:59";
      }
      delete data.pubTime;
      this.$http
        .get(
          "/rule/opinionSolicitation/getRuleOpinionSolicitationByCondition",
          data
        )
        .then((res) => {
          this.loading = false;
          if (res.code == "1") {
            this.tableData = res.data;
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
    //跳转新增页面
    addData() {
      this.$store.dispatch("changeIsAddRoute", true);
      this.editId = "";
      this.$router.push({
        name: "Editsolicitingopinions",
        query: {},
      });
    },
    //数据导出
    exportes() {
      alert("导出");
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
    //删除文件
    handleRemove(file, fileList) {
      if (this.editId != "") {
        let data = {
          id: this.editId,
          delFileabsolutepath: file.path,
        };
        this.$http
          .post("/rule/managementMethod/deleteFile", data)
          .then((res) => {
            if (res.code === 1) {
              this.$message.success("删除文件成功！");
              this.init();
            } else {
              this.$message.error(res.msg);
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    },

    //查看
    view(row) {
      //跳转至查询页面
       this.$store.dispatch("changeIsAddRoute", true);
      this.$router.push({
        name: "Viewcommentdetails",
        query: {
          row: JSON.stringify(row),
        },
      });
    },
    //编辑数据
    editData(row) {
      this.$store.dispatch("changeIsAddRoute", true);
      this.$router.push({
        name: "Editsolicitingopinions",
        query: {
          row: JSON.stringify(row),
        },
      });
    },
    //删除数据
    deleteData(row) {
      if (row == "more" && this.multipleSelection.length == 0) {
        this.$message.warning("请选择需要操作的数据");
        return;
      }
      this.$confirm("此操作将永久删除该数据, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
         
          let data = {
            id: row.id,
          };
          this.$http
            .get("/rule/opinionSolicitation/deleteRuleOpinionSolicitation", data)
            .then((res) => {
              if (res.code == "1") {
                this.$message({
                  type: "success",
                  message: "删除成功!",
                });
                this.init();
              } else {
                this.$message.error(res.msg);
              }
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },

    //重置查询表单
    resizeQuery() {
      Object.keys(this.queryForm).forEach((key) => {
        this.queryForm[key] = "";
      });
    },
  },
};
</script>

<style scoped="scoped" lang="scss">
.one_level {
  .header {
    height: 72px;
    width: 100%;
    background: #ffffff;
    box-shadow: 0px 4px 7px 1px rgba(84, 137, 199, 0.09);
    border-radius: 10px;
    position: relative;
    .query_info {
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
      background: #00479d;
      color: white;
      margin-top: 20px;
      margin-right: 20px;
      border-radius: 4px;
      border: 1px solid #00479d;
      line-height: 32px;
      float: right;
    }
    .exportes_btn {
      background: #ffffff;
      width: 80px;
      height: 32px;

      color: #00479d;
      margin-top: 20px;
      margin-right: 20px;
      border-radius: 4px;
      border: 1px solid #00479d;
      line-height: 32px;
      float: right;
    }
    .pub_btn {
      float: right;
      width: 80px;
      height: 32px;
      background: #00479d;
      color: white;
      border-radius: 4px;
      border: 1px solid #00479d;
      line-height: 32px;
      margin-top: 20px;
      margin-right: 20px;
    }
    .add_btn {
      width: 80px;
      height: 32px;
      background: #00a108;
      border-radius: 4px;
      font-size: 12px;
      color: #ffffff;
      border: 1px solid #00a108;
      float: right;
      cursor: pointer;
      margin-top: 20px;
      margin-right: 20px;
    }
  }

  .table_content {
    height: 600px;
    padding: 20px;
    background: #ffffff;
    box-shadow: 0px 4px 7px 1px rgba(84, 137, 199, 0.09);
    border-radius: 10px;
    margin-top: 20px;
  }
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
</style>
