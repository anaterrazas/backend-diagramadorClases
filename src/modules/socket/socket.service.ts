import * as salaService from '../../modules/sala/sala.service';

let diagramState: any = {}; // estado por sala

export const joinRoomService = async (salaId: number) => {
  const diagrama = await salaService.getDiagrama(salaId);
  return diagrama || {};
};

export const savePizarraService = async (salaId: number, data: any) => {
  diagramState[salaId] = data;
  await salaService.saveDiagrama(salaId, data);
  return data;
};
