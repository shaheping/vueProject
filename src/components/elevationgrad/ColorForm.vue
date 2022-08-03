<template>
  <div>
    <div v-if="showColorPicker" style="position: absolute;right: 400px;top: -10px;">
      <Sketch v-model="colorPickerValue"></Sketch>
      <a-button type="primary" style="position: absolute;right: 70px;"
                @click="colors[colorInputIndex]= rgba2str(colorPickerValue.rgba)
                showColorPicker=false">
        确定
      </a-button>
      <a-button style="position: absolute;right: 0;" @click="showColorPicker=false">取消</a-button>
    </div>
    <a-form :form="form" @submit="handleSubmit">
      <a-form-item
          v-for="(k) in form.getFieldValue('keys')"
          :key="k"
          v-bind="formItemLayoutWithOutLabel"
          :required="false"
      >
        <div>
          <a-input placeholder="高程值" v-decorator="[`names[${k}]`]"
                   style="display: inline;width: 50%;margin-right: 8px"></a-input>
          <a-input v-model="colors[k]" :style="{background:'rgb('+colors[k].split(',').join(' ')+')'}"
                   placeholder="RGBA"
                   @mouseover="colorPickerValue.rgba=str2rgba(colors[k])"
                   @click="showColorPicker=true;colorInputIndex=k"
                   style="display: inline;width: 35%;margin-right: 8px"></a-input>
          <a-icon
              class="dynamic-delete-button"
              type="minus-circle-o"
              @click="() => remove(k)"
          />
        </div>
      </a-form-item>
      <a-form-item v-bind="formItemLayoutWithOutLabel">
        <a-button type="dashed" style="width: 90%" @click="add">
          <a-icon type="plus"/>
          添加
        </a-button>
        <a-button type="primary" style="width: 90%" html-type="submit">
          Submit
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import {Sketch} from 'vue-color';

let id = 0;
export default {
  name: "ColorForm",
  components: {Sketch},
  data() {
    return {
      colorPickerValue: {
        rgba: {}
      },
      formItemLayout: {
        labelCol: {
          xs: {span: 24},
          sm: {span: 4},
        },
        wrapperCol: {
          xs: {span: 24},
          sm: {span: 20},
        },
      },
      formItemLayoutWithOutLabel: {
        wrapperCol: {
          xs: {span: 24, offset: 0},
          sm: {span: 24, offset: 1},
        },
      },
      showColorPicker: false,
      colors: {},
      colorInputIndex: ""
    };
  },
  beforeCreate() {
    this.form = this.$form.createForm(this, {name: 'dynamic_form_item'});
    this.form.getFieldDecorator('keys', {initialValue: [], preserve: true});
  },
  methods: {
    remove(k) {
      const {form} = this;
      // can use data-binding to get
      const keys = form.getFieldValue('keys');
      // can use data-binding to set
      form.setFieldsValue({
        keys: keys.filter(key => key !== k),
      });
      delete this.colors[k]
    },

    add() {
      const {form} = this;
      // can use data-binding to get
      const keys = form.getFieldValue('keys');
      let nextID = id++;
      const nextKeys = keys.concat(nextID);
      this.colors[nextID] = "";
      // can use data-binding to set
      // important! notify form to detect changes
      form.setFieldsValue({
        keys: nextKeys
      });
    },

    handleSubmit(e) {
      e.preventDefault();
      let colorTable = [];
      let elevationValues = [];
      this.form.validateFields((err, values) => {
        if (!err) {
          const {keys, names} = values;
          keys.map(key => {
            colorTable.push(names[key] + ":" + this.colors[key]);
            elevationValues.push(names[key])
          });
          let min = Math.min(...elevationValues);
          colorTable.push((min - 1) + ":0,0,0,0");
          let max = Math.max(...elevationValues);
          colorTable.push((max + 1) + ":0,0,0,0");
        }
      });
      this.$emit("submit", colorTable);
    },

    rgba2str(rgba) {
      return (rgba.r ? rgba.r : 0) + ',' + (rgba.g ? rgba.g : 0) + ',' + (rgba.b ? rgba.b : 0) + (rgba.a === 1 ? '' : ',' + rgba.a * 100);
    },

    str2rgba(str) {
      let rgba = {};
      let split = str.split(",");
      rgba.r = Number.parseInt(split[0]);
      rgba.g = Number.parseInt(split[1]);
      rgba.b = Number.parseInt(split[2]);
      rgba.a = split[3] ? Number.parseFloat(split[3]) / 100 : 1;
      console.log(rgba);
      return rgba;
    }

  },
};
</script>
<style>
.dynamic-delete-button {
  cursor: pointer;
  position: relative;
  top: 4px;
  font-size: 24px;
  color: #999;
  transition: all 0.3s;
}

.dynamic-delete-button:hover {
  color: #777;
}

.dynamic-delete-button[disabled] {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>