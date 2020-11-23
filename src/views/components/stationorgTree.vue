<template>
  <div class="orgTree" v-loading="loading">
    <el-dropdown trigger="click" class="orgTree_drop" @command="handleCommand">
      <span class="el-dropdown-link orgTree_menus">
        {{ selectmenu }}<i class="el-icon-arrow-down el-icon--right"></i>
      </span>
      <el-dropdown-menu slot="dropdown" class="menuses">
        <el-dropdown-item
          v-for="item in menus"
          :key="item.id"
          :command="item"
          >{{ item.unitName }}</el-dropdown-item
        >
      </el-dropdown-menu>
    </el-dropdown>
    <div class="trees">
      <el-tree
        :data="treeData"
        :props="defaultProps"
        @node-click="handleNodeClick"
        node-key="id"
        :expand-on-click-node="false"
        default-expand-all
      >
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span>{{ node.label }}</span>
          <span>
            <el-button
              type="text"
              size="mini"
              @click="() => append(data)"
              v-if="data.chilren"
            >
              <i class="el-icon-circle-plus-outline"></i>
            </el-button>
            <el-button type="text" size="mini" v-else>
              <i class="el-icon-edit" @click.stop="show(data)"
                ><div
                  class="el-icon-edit_content"
                  v-if="showcontent == data.id"
                >
                  <div @click="edits(data)">编辑</div>
                  <div @click="delect(data)">删除</div>
                </div></i
              >
            </el-button>
          </span>
        </span>
      </el-tree>
    </div>
    <popup
      v-loading="popupLoading"
      :popupWidth="'5'"
      :popupHeight="'3'"
      v-if="showPopup"
      @confim="saveData"
      @cancel="
        showPopup = false;
        resizeForm();
      "
      :show="showPopup"
      :title="popupTitle"
    >
      <div class="prpos_title">
        上级站段名称: <span class="prpos_title_name"> {{ superiorName }}</span>
      </div>
      <el-form
        style="margin: 20px 20px 0px 0px"
        ref="addForm"
        :rules="rules"
        :model="addForm"
        label-width="60px"
      >
        <el-form-item prop="stationsName" label="组织机构名称" class="contents">
        </el-form-item>
        <el-input class="inputs" v-model="addForm.stationsName"> </el-input>
      </el-form>
    </popup>
  </div>
</template>

<script>
import popup from "../components/popup.vue";
export default {
  components: {
    popup,
  },
  data() {
    return {
      showcontent: "", //编辑栏默认不打开
      showPopup: false, //是否打开弹窗
      popupTitle: "添加", //弹窗标题
      popupLoading: false, //弹窗loading
      superiorName: "", //上级站段名称
      loading: false, //加载loading
      treeData: [], //tree数据
      onetreedata: [], //添加时那一栏的全部数据
      command: [], //选中的一级菜单
      etid: true, //若有编辑赋值为false
      defaultProps: {
        children: "chilren",
        label: "stationsName",
      },
      menus: [], //下拉数据
      selectmenu: "请选择", //选中的公司
      addForm: {
        stationsSuperId: "", //一级站段id
        stationsName: "", //二级站段名称,
      },
      rules: {
        stationsName: [
          {
            required: true,
            message: "请输入组织机构名称",
            trigger: "blur",
          },
        ],
      },
      queryForm: {
        workUnits: "", // 一级组织机构id,
        stationsSuperId: "", // 一级站段id,
        stationsId: "", //二级站段id,
        stationsTitle: "", //站段细标题,
        implDateStart: "", //施行开始时间,
        implDateEnd: "", //施行结束时间,
        docNo: "", //文号,
        serialNumber: "", //编号
      },
    };
  },
  created() {
    this.initworkUnitsoption();
    //点击别处编辑栏隐藏
    let that = this;
    document.querySelector("body").addEventListener("click", function () {
      that.showcontent = "";
      // that.$forceUpdate()
    });
  },
  methods: {
    handleCommand(command) {
      console.log(command);
      this.$emit("nodeClick", command);
      //赋值便于增加后重新渲染
      this.command = command;
      this.selectmenu = command.unitName;
      //发送请求获取下拉树的数据
      let data = {
        workUnits: command.id,
      };
      this.$http
        .get("/rule/stationsMaintain/getStationsTree", data)
        .then((res) => {
          this.loading = false;
          if (res.code == "1") {
            const treeData = res.data.map((item) => {
              let obj = {};
              obj.stationsName = item.unitName;
              obj.chilren = item.stationsChildren;
              return obj;
            });
            this.treeData = treeData;
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch((err) => {
          this.loading = false;
          console.log(err);
        });
    },
    //获取一级组织机构配置项
    initworkUnitsoption() {
      let data = {
        id: 0,
      };
      this.$http
        .post("/rule/unit/getRuleUnitListByParentId", data)
        .then((res) => {
          this.loading = false;
          if (res.code == "1") {
            this.menus = res.data;
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch((err) => {
          this.loading = false;
          console.log(err);
        });
    },
    //点击单个数
    handleNodeClick(data) {
      console.log(data);
      this.$emit("nodeClicktwo", data);
    },
    //点增加按钮打开弹窗
    append(data) {
      this.etid = true;
      this.onetreedata = data;
      this.superiorName = data.stationsName;
      this.popupTitle = "增加站段";
      this.showPopup = true;
    },
    //点击确定新增
    saveData() {
      //若true则新增接口
      if (this.etid) {
        this.addForm.stationsSuperId = this.onetreedata.chilren[0].stationsSuperId;
        let data = {
          ...this.addForm,
        };
        this.$http
          .post("/rule/stations/addMinStations", data)
          .then((res) => {
            if (res.code == "1") {
              this.popupLoading = false;
              this.showPopup = false;
              this.$message.success("新增成功！");
              this.resizeForm();
              //添加数据至前端界面
              this.handleCommand(this.command);
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
        let data = {
          ...this.addForm,
        };
        this.$http
          .post("/rule/stations/updateMinStations", data)
          .then((res) => {
            if (res.code == "1") {
              this.popupLoading = false;
              this.showPopup = false;
              this.$message.success("修改成功！");
              this.resizeForm();
              //添加数据至前端界面
              this.handleCommand(this.command);
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
    },
    show(value) {
      //显示对应的删除和编辑
      this.showcontent = value.id;
    },
    //编辑站段
    edits(value) {
      this.etid = false;
      this.popupTitle = "修改站段";
      this.showPopup = true;
      this.superiorName = value.stationsSuperName;
      this.addForm.stationsSuperId = value.stationsSuperId;
      this.addForm.stationsName = value.stationsName;
      this.addForm.id = value.id;
    },
    //删除站段
    delect(value) {
      let data = {
        id: value.id,
      };
      this.$http
        .get("/rule/stations/delStationsById", data)
        .then((res) => {
          if (res.code == "1") {
            this.popupLoading = false;
            this.showPopup = false;
            this.$message.success("删除成功！");
            this.resizeForm();
            //添加数据至前端界面
            this.handleCommand(this.command);
          } else {
            this.popupLoading = false;
            this.$message.error(res.msg);
          }
        })
        .catch((err) => {
          this.popupLoading = false;
          console.log(err);
        });
    },
    //重置添加内容
    resizeForm() {
      Object.keys(this.addForm).forEach((key) => {
        this.addForm[key] = null;
      });
    },
  },
};
</script>

<style scoped="scoped" lang="scss">
.el-dropdown-link {
  cursor: pointer;
  color: white;
}
.el-icon-arrow-down {
  font-size: 12px;
}
.demonstration {
  display: block;
  color: #8492a6;
  font-size: 14px;
  margin-bottom: 20px;
}
.orgTree {
  width: 14%;

  height: 670px;
  background: #ffffff;
  box-shadow: 0px 4px 7px 1px rgba(84, 137, 199, 0.09);
  border-radius: 10px;
  float: left;

  .trees {
    width: 100%;
    overflow: auto;
    height: 640px;
  }

  .orgTree_drop {
    width: 100%;
    text-align: center;
    background: #00479d;
    font-size: 16px;
    height: 40px;
    line-height: 40px;
    position: relative;
    .orgTree_menus {
      width: 100%;
      .el-icon-arrow-down {
        position: absolute;
        top: 15px;
        right: -110px;
      }
    }
  }
}
.el-tree {
  display: inline-block;
  padding-right: 10px;
  /deep/ .is-current {
    color: #00479d !important;
  }
}

.el-tree > .el-tree-node {
  display: inline-block;
  min-width: 100%;
}
/deep/ .el-tree-node__label {
  font-size: 12px !important;
}
/deep/ .el-icon-arrow-down {
  position: relative;
  left: 60px;
}
/deep/ .el-dropdown-menu {
  position: relative !important;
  left: -150px !important;
  top: -50px !important;
  margin-left: -100px !important;
}
.menuses {
  height: 400px;
  overflow: auto;
  width: 220px;
  position: relative;
  left: 300px !important;
  top: 175px !important;
}
/deep/ .el-tree-node {
  margin-top: 10px !important;
}
/deep/ .el-tree-node__label {
  width: 120px !important;
  overflow-x: auto;
}
/deep/ .el-button {
  margin-left: 20px;
}
/deep/ .el-tree-node__content {
  position: relative !important;
  // /deep/ .el-icon-circle-plus-outline {
  //   position: absolute !important;
  //   right: 0 !important;
  //   top: 2px !important;
  // }
}
/deep/ .el-tree__empty-text {
  display: block;
  width: 200px;
  text-align: right;
  position: relative;
  left: 40px;
  top: 20px;
}
.prpos_title {
  margin: 20px;
  .prpos_title_name {
    color: blue;
  }
}
.inputs {
  margin-top: -10px;
  margin-left: 20px;
  width: 300px;
}
/deep/ .el-form-item__label {
  width: 500px !important;
  text-align: left;
  padding-left: 20px;
}
/deep/ .custom-tree-node {
  position: relative !important;
  display: block !important;
  height: 40px !important;
  /deep/ .el-icon-edit_content {
    position: absolute !important;
    width: 30px !important;
    height: 40px !important;
    right: 0px !important;
    top: 0 !important;
    z-index: 1000000 !important;
    line-height: 18px;
    font-size: 14px;
    div{
      color: black;
    }
  }
}
/* 设置滚动条的样式 */
::-webkit-scrollbar {
  width: 5px;
  height: 5px;
  background-color: white;
}

/* 滚动槽 */
::-webkit-scrollbar-track {
  border-radius: 10px;
}

/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: #00479D !important;
}
/deep/ .custom-tree-node{
  padding-right: 40px !important;
}
</style>
