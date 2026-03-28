import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as vehicleDb from "@/lib/vehicleDb";

export type { LocalVehicle as Vehicle } from "@/lib/vehicleDb";

const VEHICLES_KEY = ["local-vehicles"] as const;

export function getListVehiclesQueryKey() {
  return VEHICLES_KEY;
}

export function getGetVehicleQueryKey(id: number) {
  return [...VEHICLES_KEY, id] as const;
}

export function useListVehicles() {
  return useQuery({
    queryKey: VEHICLES_KEY,
    queryFn: vehicleDb.getAllVehicles,
  });
}

export function useGetVehicle(id: number) {
  return useQuery({
    queryKey: getGetVehicleQueryKey(id),
    queryFn: () => vehicleDb.getVehicleById(id),
    enabled: id > 0,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: vehicleDb.NewVehicle }) =>
      vehicleDb.insertVehicle(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: VEHICLES_KEY }),
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: vehicleDb.NewVehicle }) =>
      vehicleDb.updateVehicle(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: VEHICLES_KEY }),
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) => vehicleDb.deleteVehicle(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: VEHICLES_KEY }),
  });
}
