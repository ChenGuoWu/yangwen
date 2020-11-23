<template>
  <div class="organization">
    <div class="one_level">
      <div class="header">
        <div class="query_info">
          <div class="query_item">
            <el-input
              v-model="queryForm.dicName"
              class="search_query width_2rem"
            ></el-input>
            <button class="search_btn" @click="init">查询</button>
            <button class="last_search_btn" @click="addmessage">添加</button>
          </div>
        </div>
      </div>
      <div class="table_content" v-loading="loading">
        <el-table
          :header-cell-style="{
            background: '#E1E8F4',
            color: '#333333',
            fontWeight: 'bold',
            textAlign: 'left',
          }"
          
          :data="tableData"
          :cell-style="{ padding: '0' }"
          :row-style="{ height: '0.4rem' }"
          style="width: 100%; margin-bottom: 0.4rem;height:5rem"
          :cell-class-name="firstClass"
          :header-cell-class-name="headerfirstClass"
        >
          <el-table-column type="index" label="序号" width="340" align="left">
          </el-table-column>
          <el-table-column
            :show-overflow-tooltip="true"
            prop="dicName"
            label="键"
            align="left"
            min-width="40%"
          >
          </el-table-column>

          <el-table-column prop="dicCode" label="值" align="left" min-width="30%">
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
             min-width="20%"
            prop="ipAddress"
            border
          >
            <template slot-scope="scope" class="operating">
              <el-button
                @click="editData(scope.row)"
                type="text"
                size="small "
                style="color: ##00479d"
                >编辑</el-button
              >
              <el-button
                @click="deleteData(scope.row)"
                type="text"
                size="small"
                style="color: #ff3d3d"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
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
    <popup
      v-loading="popupLoading"
      :popupWidth="'5'"
      :popupHeight="'5'"
      v-if="showPopup"
      @confim="saveData"
      @cancel="
        showPopup = false;
        resizeForm();
      "
      :show="showPopup"
      :title="popupTitle"
    >
      <el-form
        style="margin: 20px 20px 0px 0px"
        ref="addForm"
        :rules="rules"
        :model="addForm"
        label-width="60px"
      >
        <el-form-item prop="dicName" label="键" class="contents">
        </el-form-item>
        <el-input v-model="addForm.dicName" class="inputs"></el-input>
        <el-form-item prop="dicTypeDes" label="值" class="contents">
        </el-form-item>
        <el-input v-model="addForm.dicTypeDes" class="inputs"></el-input>
        <el-form-item prop="description" label=" 描述" class="contents lastcontents">
        </el-form-item>
        <el-input
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
          v-model="addForm.description"
          class="inputs"
        >
        </el-input>
      </el-form>
    </popup>
  </div>
</template>

<script>
import popup from "../components/popup.vue";

export default {
  name: "managementofthekeyvalue",
  components: {
    popup,
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
      popupTitle: "添加", //弹窗标题
      popupLoading: false, //弹窗loading
      addForm: {
        dicName: "", //字典分类的名称,
        dicTypeDes: "", //字典分类的描述
        description: "", //描述
        dicType: "", //所属数据字典类型,
      },
      rules: {
        dicName: [
          {
            required: true,
            message: "请输入键名",
            trigger: "blur",
          },
        ],
        dicTypeDes: [
          {
            required: true,
            message: "请输入值名",
            trigger: "blur",
          },
        ],
      },
      queryForm: {
        //查询表单
        dicType: "", //所属数据字典类型
        dicName: "", //值（数据字典的名称）,
      },
      editId: "", //修改数据id
    };
  },
  created() {

    this.queryForm.dicType = this.$route.query.dicType;
    //   this.queryForm.dicName=this.$route.query.dicName;
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

      this.$http
        .get("/rule/dataDic/queryDataDic", data)
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
    //第一排 的样式
    firstClass(row) {
      if (row.columnIndex == 0) {
        return "addcss";
      }
      //表头最后一排样式
      if (row.columnIndex == 3) {
        return "addborder";
      }
    },
    //表头样式
    headerfirstClass(row) {
      //表头第一排样式
      if (row.columnIndex == 0) {
        return "addcss";
      }
      //表头最后一排样式
      if (row.columnIndex == 3) {
        return "addcsscenter";
      }
    },
    //点击添加
    addmessage() {
      this.popupTitle = "添加";
      this.editId = "";
      this.showPopup = true;
    },

    //添加数据
    saveData() {
      this.$refs["addForm"].validate((valid) => {
        if (valid) {

          this.popupLoading = true;
          if (!this.editId) {
            let data = {
              ...this.addForm,
            };
            this.$http
              .post("/rule/dataDic/addDataDic", data)
              .then((res) => {
                if (res.code == "1") {
                  this.popupLoading = false;
                  this.showPopup = false;
                  this.$message.success("添加成功！");
                  this.resizeForm();
                  this.init();
                } else {
                  this.popupLoading = false;
                  this.$message.error(res.msg);
                }
              })
              .catch((err) => {
                this.popupLoading = false;
                console.log(err);
              });
          } else {
            let data = JSON.parse(JSON.stringify(this.addForm));
            data.id = this.editId;
            this.$http
              .post("/rule/dataDic/updateDataDic", data)
              .then((res) => {
                if (res.code == "1") {
                  this.popupLoading = false;
                  this.showPopup = false;
                  this.$message.success("修改成功！");
                  this.resizeForm();
                  this.init();
                } else {
                  this.popupLoading = false;
                  this.$message.error(res.msg);
                }
              })
              .catch((err) => {
                this.popupLoading = false;
                console.log(err);
              });
          }
        } else {
          this.$message.warning("请确认必填项是否填写完整!");
        }
      });
    },
    //重置添加内容
    resizeForm() {
      Object.keys(this.addForm).forEach((key) => {
        this.addForm[key] = null;
      });
    },
    //编辑数据
    editData(row) {

      this.editId = row.id;
      this.popupTitle = "修改";
      Object.keys(this.addForm).forEach((key) => {
        this.addForm[key] = row[key];
      });
      this.showPopup = true;
    },
    //删除数据
    deleteData(row) {
    
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
            .get("/rule/dataDic/deleteDataDic", data)
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
        width: 100%;
        .search_query {
          width: 300px;
          margin-left: 10px;
          margin-top: 20px;
          float: left;
        }
        .search_btn {
          width: 80px;
          height: 32px;
          background: #00479d;
          color: white;
          margin-top: 20px;
          margin-left: 20px;
          border-radius: 4px;
          border: 1px solid #00479d;
          line-height: 32px;
          float: left;
        }
        .last_search_btn {
          width: 80px;
          height: 32px;
          background: #00a108;
          color: white;
          margin-top: 20px;
          margin-right: 20px;
          border-radius: 4px;
          border: 1px solid #00a108;
          line-height: 32px;
          float: right;
        }
        display: inline-block;
        span {
          font-size: 14px;
          padding-left: 20px;
          float: left;
          margin-top: 20px;
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
/deep/ .addcss {
  padding-left: 30px !important;
}
/deep/ .addcsscenter {
  text-align: center !important;
  border-left: 1px solid #e1e8f4 !important;
}
/deep/ .el-table__row td:last-of-type .cell {
  display: flex;
  justify-content: space-around !important;
}
/deep/ .addborder {
  border-left: 1px solid #e1e8f4;
}
.inputs {
  width: 400px;
  height: 32px;
  transform: translateX(-50%);
  margin-left: 50%;
}
.contents {
  transform: translate(-10%, 50%);
}
.lastcontents{
  transform: translate(-6%, 50%) !important;
}
</style>
