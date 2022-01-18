import { generateYamlForEnv, dumpYaml } from '../dsl/serialize-to-yaml'
import { OpsEnv } from '../dsl/types/input-types'
import { UberChart } from '../dsl/uber-chart'
import { Envs } from '../environments'
import { ChartName, ChartNames, charts } from '../uber-charts/all-charts'

export const renderEnv = (env: OpsEnv, chartName: ChartName) => {
  let uberChart = new UberChart(Envs[env])
  process.stdout.write(
    dumpYaml(
      uberChart,
      generateYamlForEnv(uberChart, ...charts[chartName][env]),
    ),
  )
}
