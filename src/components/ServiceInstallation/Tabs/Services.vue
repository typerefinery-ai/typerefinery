
<template>
    <div class="card service_container">
        <div class="mb-2" v-if="!servicesLoaded">
            <p class="text-black text-md">
                Services are installing and starting. This may take a few minutes.
            </p>
            <span class="text-blue-800 text-sm text-button" @click="onTabClicked('DOCUMENTATION')">Mean while, you can read the documentation.</span>

        </div>
        <div class="mb-2" v-else>
            <p class="text-black text-md">
                Services are installed and running.
            </p>
            <span class="text-blue-800 text-sm text-button" @click="onTabClicked('FINISH')">
                Now you can jump to the dashboard.
            </span>
        </div>
        <DataTable scrollable scrollHeight="80vh" :value="listOfServices" tableStyle="min-width: 50rem; width: 100%" :scrollable="true">
            <template #header>
                <div class="flex flex-wrap align-items-center justify-content-between gap-2">
                    <span class="text-xl text-900 font-bold">Services</span>
                    <span class="text-sm text-900 font-bold">Last fetched: {{lastFetched}}</span>
                    <Button @click="fetchServiceStatus()" icon="pi pi-refresh" rounded raised />
                </div>
            </template>
            <Column field="name" header="Name"></Column>
            <Column header="Status">
                <template #body="slotProps">
                    <Tag :value="getStatusText(slotProps.data.status)" :severity="getSeverity(slotProps.data)" />
                </template>
            </Column>
            <Column header="Actions">
                <template #body="{ data, index }">
                    <!-- if getSeverity(slotProps.data) is danger then show the button -->

                    <Button  type="button" size="small" icon="pi pi-refresh" @click="onRestartService(data, index)" />
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<script>
import { getModule } from "vuex-module-decorators"
import PrimeVue from "primevue/config";
import "primeflex/primeflex.css";
import "primevue/resources/themes/lara-light-blue/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";
import DataTable from "primevue/datatable"
import Button from "primevue/button"
import Tag from "primevue/tag"
import Column from "primevue/column"

import Services from "@/store/Modules/Services"
const servicesModule = getModule(Services)
export default {
    name: 'Services',
    data() {
        return {
            listOfServices: [],
            statusToTextLookup: {
                "INVALIDCONFIG": "-10",
                "ERROR" : "-1",
                "DISABLED" : "0",
                "LOADED" : "1",
                "ARCHIVED" : "10",
                "EXTRACTING" : "15",
                "EXTRACTED" : "20",
                "INSTALLING" : "25",
                "INSTALLED" : "30",
                "AVAILABLE" : "50",
                "STOPPING" : "65",
                "STOPCOMMANDSTART" : "70",
                "STOPCOMMANDEND" : "75",
                "STOPPED" : "80",
                "STARTING" : "90",
                "DEPENDENCIESWAIT" : "100",
                "DEPENDENCIESNOTREADY" : "104",
                "DEPENDENCIESREADY" : "105",
                "STARTED" : "120",
            },
            lastFetched: 'Just now',
            servicesToCheck: [
                "fastapi",
                "typedb",
                "totaljs-flow",
                "totaljs-messageservice",
            ]
        };
    },
    components: {
        DataTable,
        Column,
        Button,
        Tag
    },
    props: {
        services: {
            type: Array
        },
        getServices: {
            type: Function,
            required: true,
        }
    },
    emits: ["tabClicked"],
    mounted() {
        this.fetchServiceStatus();
    },
    
    computed: {
        servicesLoaded() {
            return servicesModule.data.servicesStarted
        },
    },
    methods: {
        getSeverity(service) {
            switch (service.status) {
                case "-10":
                case "-1": 
                case "0":
                    return "danger";
                    
                case "10":  
                case "1":
                case "30":
                    return "info";

                
                case "120":
                    return "success";
                
                default:
                    return "warning";

            }
        },
        fetchServiceStatus() {
            this.getServices().then((response) => {
                this.listOfServices = response;
                this.lastFetched = new Date().toLocaleTimeString();
                const requiredServices =  this.listOfServices.filter((service) => this.servicesToCheck.includes(service.id));
                const reqServicesStarted = requiredServices.every((service) => service.status === "120");
                if (!reqServicesStarted) {
                    servicesModule.setServicesStopped()
                } else {
                    servicesModule.setServicesStarted()
                }
            });
        },
        getStatusText(status) {
            // return the key and search by value
            return Object.keys(this.statusToTextLookup).find(key => this.statusToTextLookup[key] === status);
            
        },
        servicesLoaded() {
            return servicesModule.data.servicesStarted
        },
        onTabClicked(tab) {
            console.log('tab clicked', tab);
            this.$emit('tab-clicked', tab);
        },
        onRestartService(service, index) {
            console.log(service.id, index)
            servicesModule.restartService(service.id).then((response) => {
                console.log('response', response)
                if(response && response === true) {
                   this.fetchServiceStatus();
                }
            });
        }
    }
};
</script>

<style scoped>
    .service_container {
        width: 100%;
        margin: auto;
        padding: 10px;
    }
    .text-button {
        cursor: pointer;
    }
</style>
