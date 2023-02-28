<template>
    <div class="experienceDialog">
        <Dialog v-model:visible="displayEditPopup" :header="$t(`components.dialog.popup.heading`)" :modal="true"
            :closable="false" :style="{ width: '350px' }">
            <template #header>
                <!-- add here header -->
                        <span v-if="addElements" class="p-dialog-title"> {{
        $t(`components.setting.experience.add-experience`)
      }}
                        </span>
                        <span v-if="editElements" class="p-dialog-title">
                            {{
        $t(`components.setting.experience.edit-experience`)
      }}
                        </span>
                
                    <div class="p-dialog-header-icons">
                        <button class="p-dialog-header-icon p-dialog-header-close p-link" aria-label="close" type="button"
                            @click="closeDialog">
                            <span class="p-dialog-header-close-icon pi pi-times"></span>
                        </button>
                    </div>
               
            </template>
            <div class="field">
                <label for="name">{{
        $t(`components.setting.experience.label`)
      }}</label>
                <InputText id="name" v-model="label" />
            </div>
            <div class="field">
                <label for="icon">{{
        $t(`components.setting.experience.icon`)
      }}</label>
                <InputText id="icon" v-model="icon" />
            </div>
            <div class="field">
                <label for="url">{{
        $t(`components.setting.experience.url`)
      }}</label>
                <InputText id="url" v-model="url" />
            </div>
            <template #footer>
                <Button :label="$t(`components.setting.experience.buttons.cancel`)"  icon="pi pi-times" class="p-button-text" @click="closeDialog"></Button>
                <Button v-if="editElements" :label="$t(`components.setting.experience.buttons.save`)"  type="button" icon="pi pi-check" @click="editMenuItem"></Button>
                <Button v-if="addElements" :label="$t(`components.setting.experience.buttons.add`)"  type="button" icon="pi pi-check" @click="addMenuItem"></Button>
            </template>
        </Dialog>
    </div>
</template>
  
<script>
import { getModule } from "vuex-module-decorators"
import Dialog from "primevue/dialog"
import Button from "primevue/button"
import Projects from "@/store/Modules/Projects"
import AppData from "@/store/Modules/AppData"
import Queries from "@/store/Modules/Queries"
import InputText from "primevue/inputtext"
import Connections from "@/store/Modules/Connections"
import Themes from "@/store/Modules/Theme"
import { errorToast, successToast } from "@/utils/toastService"
import Settings from "@/store/Modules/Settings"
import { nanoid } from "nanoid"
const settingsModule = getModule(Settings)
const projectsModule = getModule(Projects)
const appDataModule = getModule(AppData)
const queryModule = getModule(Queries)
const connectionModule = getModule(Connections)
const themeModule = getModule(Themes)

export default {
    name: "EditExprience",
    components: {
        Dialog,
        Button,
        InputText
    },
    data() {
        return {
            listOfExperiences: {},
            displayEditPopup: true,
            addElements: false,
            editElements: false,
            loading: false,
            name: "",
            icon: "",
            url: ""
        }
    },
    props: {
        editDialog: { type: Boolean, default: false },
        exprienceId: { type: String, default: "" },
        type: { type: String, required: true },
        payload: { type: Object, required: true },
        updateExperinceInfo: { type: Function, default() { return {}} }
    },
    emits: ["close"],
    mounted() {
        this.listOfExperiences = JSON.parse(JSON.stringify(settingsModule.data.listOfMenu))
        if (this.type === "UPDATE") {
            this.label = this.payload.label,
                this.icon = this.payload.icon,
                this.url = this.payload.url,
                this.editElements = true
        }
        else if (this.type === "ADD") {
            this.label = "",
                this.icon = "",
                this.url = "",
                this.addElements = true
        }

    },
    methods: {
        closeDialog() {
            this.$emit("close")
        },
        editMenuItem() {           
            const data = {
                ...this.payload,
                label: this.label,
                icon: this.icon,
                url: this.url
            };           
            settingsModule.updateMenuitem(data)
            this.updateExperinceInfo(this.payload.id,data)
            this.closeDialog()
        },
        addMenuItem() {
            const id = nanoid(14),
                data = {
                    label: this.label,
                    icon: this.icon,
                    id: id,
                    code: id,
                    url:this.url,
                    to: `/experience/${id}`,
                    type: "experimental",
                    enabled: false,
                    subMenu: [{ id: "load-data", to: "#" }],
                };
            settingsModule.addExprience(data)
            this.updateExperinceInfo(data.id,data)
            this.closeDialog()
        }

    },
}
</script>
<style scoped lang="scss">
.p-inputtext {
    width: 100% !important;
}

p {
    margin: 0;
}
.confirmation-content {
    display: flex;
    align-items: center;
}

.p-dialog .p-button {
    min-width: 6rem;
}

.field {
    display: grid;
}

.deleteIcon {
    font-size: 2rem;
}

.p-dialog-header {
      padding: 1.25rem 1.8rem;

      .p-dialog-header-icon:last-child {
     margin-left:10rem;
      }
    }

#deleteTreeNode {
    color: white;
    background-color: #ef4444;
}
</style>
  