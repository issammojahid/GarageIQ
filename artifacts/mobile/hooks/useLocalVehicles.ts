import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as vehicleDb from "@/lib/vehicleDb";
import {
  getVehiclePhoto,
  setVehiclePhoto,
  removeVehiclePhoto,
} from "@/lib/vehiclePhotoStorage";

export type { LocalVehicle } from "@/lib/vehicleDb";

export type Vehicle = vehicleDb.LocalVehicle & { photo?: string | null };

const VEHICLES_KEY = ["local-vehicles"] as const;

export function getListVehiclesQueryKey() {
  return VEHICLES_KEY;
}

export function getGetVehicleQueryKey(id: number) {
  return [...VEHICLES_KEY, id] as const;
}

async function enrichWithPhoto(v: vehicleDb.LocalVehicle): Promise<Vehicle> {
  const photo = await getVehiclePhoto(v.id);
  return { ...v, photo };
}

async function enrichListWithPhotos(
  vehicles: vehicleDb.LocalVehicle[]
): Promise<Vehicle[]> {
  return Promise.all(vehicles.map(enrichWithPhoto));
}

export function useListVehicles() {
  return useQuery({
    queryKey: VEHICLES_KEY,
    queryFn: async () => {
      const vehicles = await vehicleDb.getAllVehicles();
      return enrichListWithPhotos(vehicles);
    },
  });
}

export function useGetVehicle(id: number) {
  return useQuery({
    queryKey: getGetVehicleQueryKey(id),
    queryFn: async () => {
      const v = await vehicleDb.getVehicleById(id);
      if (!v) return null;
      return enrichWithPhoto(v);
    },
    enabled: id > 0,
  });
}

export type NewVehicleWithPhoto = vehicleDb.NewVehicle & {
  photo?: string | null;
};

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data }: { data: NewVehicleWithPhoto }) => {
      const { photo, ...vehicleData } = data;
      const created = await vehicleDb.insertVehicle(vehicleData);
      if (photo) {
        await setVehiclePhoto(created.id, photo);
      }
      return { ...created, photo: photo ?? null };
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: VEHICLES_KEY }),
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: NewVehicleWithPhoto;
    }) => {
      const { photo, ...vehicleData } = data;
      await vehicleDb.updateVehicle(id, vehicleData);
      if (photo) {
        await setVehiclePhoto(id, photo);
      } else if (photo === null) {
        await removeVehiclePhoto(id);
      }
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: VEHICLES_KEY }),
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      await vehicleDb.deleteVehicle(id);
      await removeVehiclePhoto(id);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: VEHICLES_KEY }),
  });
}
