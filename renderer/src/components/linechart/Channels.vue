<template>
  <div class="mt-3">
    <v-row>
      <v-col>
        <v-select
          class="mt-3"
          dense
          @change="(v) => $store.commit('setLeftPlateChannel', v)"
          :value="$store.state.lineChart.leftPlateChannel"
          :items="leftForcePlateChannels"
          label="Channels"
          outlined
        ></v-select>
      </v-col>
      <v-col>
        <v-select
          class="mt-3"
          dense
          @change="(v) => $store.commit('setRightPlateChannel', v)"
          :value="$store.state.lineChart.rightPlateChannel"
          :items="rightForcePlateChannels"
          label="Channels"
          outlined
        ></v-select>
      </v-col>
      <v-col>
        <v-select
            dense
          @change="
            (v) => {
              $store.commit('setDataTypeAtLineChart', v);
              $store.commit('resetLineChartState');
            }
          "
          dense
          class="mt-3"
          :disabled="$store.state.options.isSessionRunning"
          :value="$store.state.lineChart.dataType"
          :items="dataTypes"
          label="Data Type"
          outlined
        ></v-select>
      </v-col>
      <v-col>
        <v-text-field
          dense
          class="mt-3"
          @change="(v) => $store.commit('setThresholdAtLineChart', Number(v))"
          :value="$store.state.lineChart.threshold"
          label="Threshold (%BW) - Standard value = 5"
          outlined
          :disabled="$store.state.options.isSessionRunning"
          min="0"
        />
      </v-col>
      <v-col>
        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              dense
              v-bind="attrs"
              v-on="on"
              class="mt-3"
              @change="
                (v) => $store.commit('setNofLinesAtLineChart', Number(v))
              "
              :value="$store.state.lineChart.nOfLines"
              label="Display"
              outlined
              :disabled="$store.state.options.isSessionRunning"
              min="0"
            />
          </template>
          <span>Number of Lines</span>
        </v-tooltip>
      </v-col>
      <v-col>
        <v-btn
          dense
          @click="$store.commit('resetLineChartState')"
          class="resetButton mt-4"
          >Reset</v-btn
        >
      </v-col>
    </v-row>
    <v-row class="mt-3 pt-0">
      <v-col cols="2" class="mt-0 pt-0">
        <v-text-field
          @change="(v) => $store.commit('setTime', Number(v))"
          :value="$store.state.options.timeout"
          label="Time (in seconds)"
          outlined
          dense
          :disabled="$store.state.options.isSessionRunning"
          min="0"
        />
      </v-col>
      <v-col cols="2" class="mt-0 pt-0">
        <v-btn
          elevation="25"
          dense
          :disabled="this.$store.state.options.session == -1"
          :class="
            isTrialRunning
              ? 'stopButton mt-1'
              : 'startButton mt-1'
          "
          @click="() => startStopTrial()"
        >
          {{ isTrialRunning ? "Stop" : "Start" }}
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script>
const { ipcRenderer } = window.require("electron");
const {
  CREATE_TRIAL,
  CREATE_TRIAL_RESPONSE,
  START_TRIAL_WRITING, STOP_TRIAL_WRITING,
  AFTER_TRIAL_PROCESS,
  AFTER_TRIAL_PROCESS_RESPONSE
} = require("../../../../main/util/types");

export default {
  data() {
    return {
      dataTypes: ["Normalized", "Absolute"],
      leftForcePlateChannels: [
        "FX1",
        "FY1",
        "FZ1",
        "MX1",
        "MY1",
        "MZ1",
        "COPX1",
        "COPY1",
        "COPXY1",
      ],
      rightForcePlateChannels: [
        "FX2",
        "FY2",
        "FZ2",
        "MX2",
        "MY2",
        "MZ2",
        "COPX2",
        "COPY2",
        "COPXY2",
      ],
      isTrialRunning: false,
      timeoutInstance: null,
    };
  },
  mounted() {
    ipcRenderer.on(CREATE_TRIAL_RESPONSE, (_, responseData) => {
     this.isTrialRunning = true;
      this.$store.commit("setTrial", responseData.trial);
      this.$store.commit("setTrialId",responseData.trialId)
      ipcRenderer.send(START_TRIAL_WRITING,{ trial: responseData.trial })
      this.timeoutInstance = setTimeout(() => {
        ipcRenderer.send(STOP_TRIAL_WRITING,{
          database: this.$store.state.options.database , 
          session: this.$store.state.options.session ,
          trialId: this.$store.state.options.trialId 
        })
        ipcRenderer.send(AFTER_TRIAL_PROCESS,{
          database: this.$store.state.options.database , 
          trialId: this.$store.state.options.trialId 
        })
      }, this.$store.state.options.timeout * 1000);
    });

    ipcRenderer.on(AFTER_TRIAL_PROCESS_RESPONSE, (_, responseData) => {
      this.isTrialRunning = false;
      this.$store.commit("setTrial", "");
      this.$store.commit("setTrialId",-1);
    });
  },
  methods: {
    startStopTrial(){
      if(this.isTrialRunning){
        clearTimeout(this.timeoutInstance);
        ipcRenderer.send(STOP_TRIAL_WRITING,{
          database: this.$store.state.options.database , 
          session: this.$store.state.options.session ,
          trialId: this.$store.state.options.trialId 
        })
        ipcRenderer.send(AFTER_TRIAL_PROCESS,{
          database: this.$store.state.options.database , 
          trialId: this.$store.state.options.trialId 
        })
      } else {
        if(this.$store.state.options.session != -1){
          ipcRenderer.send(CREATE_TRIAL,{ 
            session: this.$store.state.options.session,
            database: this.$store.state.options.database, 
            userId: this.$store.state.options.user.id,
          })
        }
      }
    },
  },
};
</script>

<style>
.v-menu__content.theme--dark::-webkit-scrollbar {
  background-color: transparent !important;
  width: 0px;
}
.v-menu__content.theme--dark.menuable__content__active::-webkit-scrollbar-track {
  background-color: transparent;
  width: 0px;
}
.v-text-field.v-text-field--enclosed .v-text-field__details {
  display: none !important;
}
</style>

<style scoped>
.resetButton {
  background: #6ab187 !important;
}
.startButton {
  background: #6ab187 !important;
}
.stopButton {
  background: #d32d41 !important;
}
</style>