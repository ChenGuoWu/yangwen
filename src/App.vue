<template>
  <div id="app">
    <div id="nav">
      <router-view></router-view>
    </div>
  </div>
</template>

<style lang="scss">
	@import 'util/resize.css';
	@import 'util/common.css';
#app {
  font-family: Microsoft Yahei;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #333333;
  font-size: 14px;
}

</style>
