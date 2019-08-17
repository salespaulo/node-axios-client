'use strict'

module.exports = instance => {
    return {
        // Tasks
        getTasksByDefinitionKey: async (processDefinitionKey, taskDefinitionKey) => {
            return await instance.get(
                `/engine-rest/task?processDefinitionKey=${processDefinitionKey}&taskDefinitionKey=${taskDefinitionKey}`
            )
        },
        doTaskClaim: async (taskId, username) => {
            return await instance.post(`/engine-rest/task/${taskId}/claim`, { userId: username })
        },
        getTaskVariables: async taskId => {
            const resVariables = await instance.get(`/engine-rest/task/${taskId}/variables`)
            const variables = resVariables.data

            if (!variables) {
                return { data: {} }
            }

            const vars = {}
            const keys = Object.keys(variables)

            for (let k in keys) {
                vars[`${keys[k]}`] = variables[`${keys[k]}`].value
            }

            return { data: vars }
        },
        doTaskComplete: async (taskId, vars) => {
            const keys = Object.keys(vars)
            const variables = {}

            for (let k in keys) {
                variables[`${keys[k]}`] = {
                    value: vars[keys[k]],
                    type: 'String'
                }
            }

            return await instance.post(`/engine-rest/task/${taskId}/complete`, { variables })
        },
        // Process
        getProcessInstanceByTaskId: async taskId => {
            const resTask = await instance.get(`/engine-rest/task/${taskId}`)
            const task = resTask.data
            const resInstance = await instance.get(
                `/engine-rest/process-instance/${task.processInstanceId}`
            )
            return resInstance
        },
        doStart: async (processKey, vars) => {
            const keys = Object.keys(vars)
            const variables = {}
            let businessKey = null

            for (let k in keys) {
                if (keys[k] === 'businessKey') {
                    businessKey = vars[keys[k]]
                }

                variables[`${keys[k]}`] = {
                    value: vars[keys[k]],
                    type: 'String'
                }
            }

            return await instance.post(`/engine-rest/process-definition/key/${processKey}/start`, {
                businessKey,
                variables
            })
        }
    }
}
