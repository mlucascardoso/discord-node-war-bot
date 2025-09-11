import {
    createNodeWarConfig as dbCreateNodeWarConfig,
    getAllNodeWarTypes as dbGetAllNodeWarTypes,
    getNodeWarConfigsByTypeId as dbGetNodeWarConfigsByTypeId,
    updateNodeWarConfig as dbUpdateNodeWarConfig
} from '../database/entities/nodewar.js';

export const getAllNodeWarTypes = async () => {
    const members = await dbGetAllNodeWarTypes();
    return members;
};

export const getNodeWarTypeById = async (id) => {
    const member = await dbGetNodeWarConfigsByTypeId(id);
    return member;
};

export const createNodeWarTemplate = async (nodeWarTemplateData) => {
    const validation = validateNodeWarTemplateBasicData(nodeWarTemplateData);
    if (!validation.isValid) {
        return { success: false, error: 'Erro de validação', details: validation.errors };
    }
    const validationConfigs = validateNodeWarConfigs(nodeWarTemplateData);
    if (!validationConfigs.isValid) {
        return { success: false, error: 'Erro de validação', details: validationConfigs.errors };
    }
    const validationMaxSlots = validateNodeWarMaxSlots(nodeWarTemplateData);
    if (!validationMaxSlots.isValid) {
        return { success: false, error: 'Erro de validação', details: validationMaxSlots.errors };
    }
    const nodeWarConfig = await dbCreateNodeWarConfig(nodeWarTemplateData);
    return { success: true, data: nodeWarConfig };
};

export const updateNodeWarTemplate = async (id, nodeWarTemplateData) => {
    const validation = validateNodeWarTemplateBasicData(nodeWarTemplateData);
    if (!validation.isValid) {
        return { success: false, error: 'Erro de validação', details: validation.errors };
    }
    const validationConfigs = validateNodeWarConfigs(nodeWarTemplateData);
    if (!validationConfigs.isValid) {
        return { success: false, error: 'Erro de validação', details: validationConfigs.errors };
    }
    const validationMaxSlots = validateNodeWarMaxSlots(nodeWarTemplateData);
    if (!validationMaxSlots.isValid) {
        return { success: false, error: 'Erro de validação', details: validationMaxSlots.errors };
    }
    const nodeWarConfig = await dbUpdateNodeWarConfig(id, nodeWarTemplateData);
    return { success: true, data: nodeWarConfig };
};

const validateNodeWarTemplateBasicData = (nodeWarTemplateData) => {
    const errors = [];
    if (!nodeWarTemplateData.name?.trim() || nodeWarTemplateData.name?.length > 100) {
        errors.push('Nome é obrigatório');
    }
    if (!nodeWarTemplateData?.informativeText?.trim() || nodeWarTemplateData?.informativeText?.length > 1000) {
        errors.push('Texto informativo é obrigatório');
    }
    if (!nodeWarTemplateData.tier) {
        errors.push('Tier é obrigatório');
    }
    return { isValid: errors.length === 0, errors };
};

const validateNodeWarConfigs = (nodeWarTemplateData) => {
    const errors = [];
    if (!nodeWarTemplateData.bomberSlots || nodeWarTemplateData.bomberSlots < 0 || !Number.isInteger(nodeWarTemplateData.bomberSlots)) {
        errors.push('Slots de bomber são obrigatórios');
    }
    if (!nodeWarTemplateData.frontlineSlots || nodeWarTemplateData.frontlineSlots < 0 || !Number.isInteger(nodeWarTemplateData.frontlineSlots)) {
        errors.push('Slots de frontline são obrigatórios');
    }
    if (!nodeWarTemplateData.rangedSlots || nodeWarTemplateData.rangedSlots < 0 || !Number.isInteger(nodeWarTemplateData.rangedSlots)) {
        errors.push('Slots de ranged são obrigatórios');
    }
    if (!nodeWarTemplateData.shaiSlots || nodeWarTemplateData.shaiSlots < 0 || !Number.isInteger(nodeWarTemplateData.shaiSlots)) {
        errors.push('Slots de shai são obrigatórios');
    }
    if (!nodeWarTemplateData.paSlots || nodeWarTemplateData.paSlots < 0 || !Number.isInteger(nodeWarTemplateData.paSlots)) {
        errors.push('Slots de pa são obrigatórios');
    }
    if (!nodeWarTemplateData.flagSlots || nodeWarTemplateData.flagSlots < 0 || !Number.isInteger(nodeWarTemplateData.flagSlots)) {
        errors.push('Slots de flag são obrigatórios');
    }
    if (!nodeWarTemplateData.defenseSlots || nodeWarTemplateData.defenseSlots < 0 || !Number.isInteger(nodeWarTemplateData.defenseSlots)) {
        errors.push('Slots de defense são obrigatórios');
    }
    if (!nodeWarTemplateData.callerSlots || nodeWarTemplateData.callerSlots < 0 || !Number.isInteger(nodeWarTemplateData.callerSlots)) {
        errors.push('Slots de caller são obrigatórios');
    }
    if (!nodeWarTemplateData.elephantSlots || nodeWarTemplateData.elephantSlots < 0 || !Number.isInteger(nodeWarTemplateData.elephantSlots)) {
        errors.push('Slots de elephant são obrigatórios');
    }
    if (!nodeWarTemplateData.waitlist || nodeWarTemplateData.waitlist < 0 || !Number.isInteger(nodeWarTemplateData.waitlist)) {
        errors.push('Fila de espera são obrigatórios');
    }
    if (!nodeWarTemplateData.totalSlots || nodeWarTemplateData.totalSlots < 0 || !Number.isInteger(nodeWarTemplateData.totalSlots)) {
        errors.push('Total de slots são obrigatórios');
    }
    return { isValid: errors.length === 0, errors };
};

const getMaxSlots = (nodeWarTemplateData) => {
    switch (nodeWarTemplateData.tier) {
        case 1:
            return 25;
        case 2:
            return 40;
        case 3:
            return 100;
        default:
            return 25;
    }
};

const validateNodeWarMaxSlots = (nodeWarTemplateData) => {
    const errors = [];
    const allRoleSlots =
        nodeWarTemplateData.bomberSlots +
        nodeWarTemplateData.frontlineSlots +
        nodeWarTemplateData.rangedSlots +
        nodeWarTemplateData.shaiSlots +
        nodeWarTemplateData.paSlots +
        nodeWarTemplateData.flagSlots +
        nodeWarTemplateData.defenseSlots +
        nodeWarTemplateData.callerSlots +
        nodeWarTemplateData.elephantSlots;
    if (allRoleSlots !== nodeWarTemplateData.totalSlots) {
        errors.push('Total de slots deve ser igual ao total de slots de todas as roles');
    }
    if (nodeWarTemplateData.totalSlots > getMaxSlots(nodeWarTemplateData) || allRoleSlots > getMaxSlots(nodeWarTemplateData)) {
        errors.push('Total de slots não pode ser maior que o máximo de slots');
    }
    return { isValid: errors.length === 0, errors };
};
