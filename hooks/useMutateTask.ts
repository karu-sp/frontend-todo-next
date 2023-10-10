import { useRouter } from "next/router";
import axios from "axios";
import { useQueryClient,useMutation } from "@tanstack/react-query";
import { Task } from "@prisma/client";
import useStore from "../store";
import { EditedTask } from "../types";

export const useMutateTask = () =>{
    const queryClient = useQueryClient();
    const router = useRouter();
    const reset = useStore((state)=>state.resetEditedTask)

    const craeteTaskMutation = useMutation(
        async (task: Omit<EditedTask, 'id'>) =>{
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/todo`,
                task
            )
            return res.data
        },
        {
            onSuccess: (res) => {
                const previousTodos = queryClient.getQueryData<Task[]>(['task'])
                if(previousTodos){
                    queryClient.setQueriesData(['tasks'],[res,...previousTodos])
                }
                reset()
            },
            onError: (err:any) => {
                reset()
                if(err.response.status === 401 || err.response.status === 403){
                    router.push('/')
                }
            },
        }
    )
    const updateTaskMutation = useMutation(
        async (task:EditedTask) => {
            const res = await axios.patch(
                `${process.env.NEXT_PUBLIC_API_URL}/todo/${task.id}`,
                task
            )
            return res.data
        },
        {
         onSuccess: (res,variable) =>{
            const previousTodos = queryClient.getQueryData<Task[]>(['task'])
            if(previousTodos){
                queryClient.setQueryData(
                    ['task'],
                    previousTodos.map((task) => (task.id === res.id ? res : task))
                )
            }
         },
         onError: (err: any) => {
            reset()
            if(err.responese.status === 401 || err.response.status === 403){
                router.push('/')
            }
         },
        }
    )
    const deleteTaskMutation = useMutation(
        async (id: number) => {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/todo/${id}`)
        },
        {
            onSuccess: (_,variables) => {
                const previousTodos = queryClient.getQueryData<Task[]>(['task'])
                if(previousTodos){
                    queryClient.setQueryData(
                        ['task'],
                        previousTodos.filter((task) => task.id !== variables)
                    )
                }
                reset()
            },
            onError: (err:any) => {
                reset()
                if(err.responese.status === 401 || err.response.status === 403){
                    router.push('/')
                }
            },
        })
    return { craeteTaskMutation, updateTaskMutation, deleteTaskMutation }
}
