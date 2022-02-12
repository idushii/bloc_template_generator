<template>
  <div class="index">
    <div class="all-models">
      <div class="model" v-for="item of allModels" :class="{active: uuid === item.uuid}"
           @click="$router.push(`/Model/${item.uuid}`)">{{ item.name }}
      </div>
      <div class="model" @click="$router.push(`/Model/Add`)">Добавить</div>
      <div class="model" @click="importModel">Import</div>
    </div>
    <div class="content" v-if="isOpen">
      <h4>Edit model {{ name }}
        <button @click="handleRemove" v-if="$route.name === 'ModelEdit'">Удалить</button>
      </h4>

      <div class="inline">
        <TextBox placeholder="Name class" v-model="name"/>
        <TextBox placeholder="Desc" v-model="desc"/>
        <SelectBox :options="[{ key: 'class', value: 'class' }, { key: 'enum', value: 'enum' }]"
                   placeholder="AdditionalInfo" v-model="AdditionalInfo"/>
      </div>

      <PropLine
          v-for="(item, index) of items" :item="item" :key="`item-${item.name}-${item.type}`"
          :is-enum="isEnum"
          :all-types="allModelsNames"
          @remove="handleRemoveItem(index)"
      />
      <PropLine
          :is-enum="isEnum"
          :item="emptyItem" @add="handleAddItem"
          :all-types="allModelsNames"
          action
      />

      <el-tabs v-model="codeLang">
        <el-tab-pane label="Dart" name="dart">
          <template v-if="codeLang === 'dart'">
            <render-code class="code" v-if="!isEnum" :items="items" :name-class="name"/>
            <render-enum-code class="code" v-if="isEnum" :items="items" :name-class="name"/>
          </template>
        </el-tab-pane>
        <el-tab-pane label="TypeScript" name="TS">
          <template v-if="codeLang === 'TS'">
            <render-code-type-script class="code" :items="items" :name-class="name" :is-enum="isEnum"/>
          </template>
        </el-tab-pane>
        <el-tab-pane label="VueJS / ElementUI / Table" name="vue_js_element_ui_table">
          <template v-if="codeLang === 'vue_js_element_ui_table'">
            <render-code-element-table class="code" v-if="!isEnum" :items="items" :name-class="name"/>
            <!--            <render-enum-code v-if="isEnum" :items="items" :name-class="name"/>-->
          </template>
        </el-tab-pane>
        <el-tab-pane label="Export" name="export">
          <template v-if="codeLang === 'export'">
            <export-code class="code" :items="items" :model="model" :name-class="name"/>
          </template>
        </el-tab-pane>
        <el-tab-pane label="Laravel / Model" name="laravel_model">
          <template v-if="codeLang === 'laravel_model'">
            <laravel-model class="code" :items="items" :name-class="name"/>
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>
    <div v-else>
      Не выбрана модель
    </div>
    <input type="file" id="files" ref="files" @change="handleFileSelect"/>

  </div>
</template>

<script lang="ts">
import PropLine from "./PropLine.vue";
import RenderCode from "@/views/ModelEditor/RenderCode.vue";
import TextBox from "@/components/TextBox.vue";
import SelectBox from "@/components/SelectBox.vue";
import {ACTIONS, MUTATIONS} from "@/store";
import {Component, Vue, Watch} from 'vue-property-decorator';
import {Model, PropItem} from "@/views/ModelEditor/RenderCodeLineType";
import RenderEnumCode from "@/views/ModelEditor/RenderEnumCode.vue";
import RenderCodeTypeScript from "@/views/ModelEditor/RenderCodeTypeScript.vue";
import RenderCodeElementTable from "@/views/ModelEditor/RenderCodeElementTable.vue";
import ExportCode from "@/views/ModelEditor/ExportCode.vue";
import LaravelModel from "@/views/ModelEditor/LaravelModel.vue";

@Component({
  components: {
    LaravelModel,
    RenderCodeElementTable,
    RenderCodeTypeScript,
    RenderEnumCode,
    SelectBox,
    TextBox,
    RenderCode,
    PropLine,
    ExportCode,
  },
})
export default class ModelEditor extends Vue {
  uuid = Math.random().toString();
  name = 'Item';
  desc = '';
  AdditionalInfo = '';
  isEnum: boolean = false;
  isOpen = true;

  codeLang = 'dart'

  @Watch('AdditionalInfo')
  onChildChanged(val: string, oldVal: string) {
    this.isEnum = val === 'enum';
  }

  @Watch('name')
  onChildChanged2(val: string, oldVal: string) {
    this.$store.dispatch(ACTIONS.SET_MODEL, this.model);
  }

  @Watch('desc')
  onChildChanged6(val: string, oldVal: string) {
    this.$store.dispatch(ACTIONS.SET_MODEL, this.model);
  }

  @Watch('isEnum')
  onChildChanged3(val: string, oldVal: string) {
    this.$store.dispatch(ACTIONS.SET_MODEL, this.model);
  }

  @Watch('items', {immediate: false, deep: true})
  onChildChanged4(val: any, oldVal: any) {
    this.$store.dispatch(ACTIONS.SET_MODEL, this.model);
  }

  @Watch('route', {immediate: false, deep: true})
  onChildChanged5(val: any, oldVal: any) {
    if (this.$route.name == 'ModelEdit') {
      this.restoreFormState(this.$route.params.uuid)
    }
    if (this.$route.name == 'ModelAdd') {
      this.handleOpenAdd()
    }
    if (this.$route.name == 'Model') {
      if (this.allModels.length) {
        this.$router.push({name: 'ModelEdit', params: {uuid: this.allModels[0].uuid}})
      }
    }
  }

  @Watch('allModels')
  onChildChanged7() {
    if (this.$route.name == 'ModelEdit' && this.uuid != this.$route.params.uuid) {
      this.restoreFormState(this.$route.params.uuid)
    }
  }

  async mounted() {
    if (this.$route.name == 'ModelEdit') {
      this.restoreFormState(this.$route.params.uuid)
    }

    if (this.$route.name == 'ModelAdd') {
      this.handleOpenAdd()
    }

    if (this.$route.name == 'Model') {
      if (this.allModels.length) {
        this.$router.push({name: 'ModelEdit', params: {uuid: this.allModels[0].uuid}})
      }
    }
  }

  handleOpenAdd() {
    this.name = 'Item';
    this.desc = '';
    this.uuid = Math.random().toString();
    this.isEnum = false;
    this.AdditionalInfo = '';

    this.items = [
      {
        name: 'id',
        desc: "ID",
        type: 'int',
        defaultValue: '0',
        nullable: false,
      },
      {
        name: 'title',
        desc: "Заголовок",
        type: 'String',
        defaultValue: '""',
        nullable: false,
      }]
  }

  get model(): Model {
    return {
      uuid: this.uuid,
      name: this.name,
      desc: this.desc,
      props: this.items,
      isEnum: this.isEnum,
    }
  }

  get allModels(): Model[] {
    return this.$store.state.models;
  }

  get allModelsNames(): Model[] {
    return this.$store.getters.allModels;
  }

  get route() {
    return this.$route.fullPath
  }

  items: PropItem[] = [];

  emptyItem: PropItem = {
    name: '',
    desc: '',
    type: 'String',
    nullable: false,
    defaultValue: '',
  }

  restoreFormState(uuid: string) {
    const item: Model = this.$store.state.models.find((e: Model) => e.uuid == uuid);
    if (item) {
      this.uuid = item.uuid;
      this.name = item.name;
      this.desc = item.desc;
      this.items = item.props;
      this.isEnum = item.isEnum;
      if (this.isEnum) this.AdditionalInfo = 'enum'
      else this.AdditionalInfo = 'class'
    }
  }

  getEmptyItem(): PropItem {
    return {
      name: '',
      desc: '',
      type: 'String',
      nullable: false,
      defaultValue: '',
    }
  };

  handleRemoveItem(index = 0) {
    this.items.splice(index, 1)
  };

  handleAddItem() {
    this.items.push({...this.emptyItem});
    this.emptyItem = this.getEmptyItem();
  };

  auth() {
    this.$store.dispatch(ACTIONS.LOGIN)
  };

  async handleRemove() {
    this.$store.commit(MUTATIONS.REMOVE_MODEL, this.uuid)
    this.$router.push({name: 'Model'})
    await this.$store.dispatch(ACTIONS.SET_MODELS, this.allModels);
    await this.$notify({message: 'Модель удалена', title: ''})
  }

  importModel() {
    (this.$refs?.files as any)?.click()
  }

  handleFileSelect(evt: any) {
    evt.stopPropagation();
    evt.preventDefault();

    console.log('handleFileSelect')
    const files = evt.target.files ?? evt.dataTransfer.files; // FileList object.
    const f = files[0];
    if (f.type == "application/json" || f.type == '') {
      const reader = new FileReader();
      const _this = this;
      reader.onload = (function (theFile: any) {
        return function (e: any) {
          const text = e.target.result
          try {
            _this.importProject(JSON.parse(text))
          } catch (e) {
          }
        }
      })(f);
      reader.readAsText(f);
    }
  }

  async importProject(json: any) {

    this.$store.commit(MUTATIONS.ADD_MODEL, json)
    await this.$store.dispatch(ACTIONS.SET_MODELS, this.allModels);
    await this.$notify({message: 'Модель импортирована', title: ''})
  }

}

</script>

<style scoped lang="scss">
.index {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-gap: 1rem;

  .content {
    display: grid;
    grid-gap: 1rem;

    h4 {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 0;

      button {
        margin-left: auto;
      }
    }

    .inline {
      input {
        width: 100%;
      }

      input {
        margin-right: 1rem;
      }

      select {
        width: 500px;
      }
    }

    .code {
      min-height: 100vh;
    }
  }

  .all-models {
    .model {
      border: 2px solid $color-gray-100;
      background-color: $color-gray-100;
      margin-bottom: 1rem;
      padding: 1rem;
      cursor: pointer;

      &.active {
        background-color: #fff;
      }
    }
  }
}

#files {
  display: none;
}

</style>