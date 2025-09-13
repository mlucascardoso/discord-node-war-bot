import Tesseract from 'tesseract.js';

import {
    createBulkParticipations as dbCreateBulkParticipations,
    createParticipation as dbCreateParticipation,
    deleteParticipation as dbDeleteParticipation,
    getAllParticipations as dbGetAllParticipations,
    getMemberParticipationStats as dbGetMemberParticipationStats,
    getParticipationById as dbGetParticipationById,
    getParticipationStats as dbGetParticipationStats,
    getParticipationsByMember as dbGetParticipationsByMember,
    getParticipationsBySession as dbGetParticipationsBySession,
    updateParticipation as dbUpdateParticipation
} from '../database/entities/member-participations.js';
import { getAllMembers, getMemberById } from '../database/entities/members.js';

const calculateStringSimilarity = (str1, str2) => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const distance = levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
};

const levenshteinDistance = (str1, str2) => {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
            }
        }
    }

    return matrix[str2.length][str1.length];
};

export const getAllParticipations = async () => {
    return dbGetAllParticipations();
};

export const getParticipationStats = async () => {
    return dbGetParticipationStats();
};

export const getParticipationById = async (id) => {
    const participation = await dbGetParticipationById(id);
    if (!participation) {
        return { success: false, error: 'Participação não encontrada' };
    }
    return { success: true, data: participation };
};

export const getParticipationsByMember = async (memberId) => {
    const memberExists = await getMemberById(memberId);
    if (!memberExists) {
        return { success: false, error: 'Membro não encontrado' };
    }
    const participations = await dbGetParticipationsByMember(memberId);
    return { success: true, data: participations };
};

export const getParticipationsBySession = async (sessionId) => {
    const participations = await dbGetParticipationsBySession(sessionId);
    return { success: true, data: participations };
};

export const getMemberParticipationStats = async (memberId) => {
    const memberExists = await getMemberById(memberId);
    if (!memberExists) {
        return { success: false, error: 'Membro não encontrado' };
    }
    const stats = await dbGetMemberParticipationStats(memberId);
    return { success: true, data: stats };
};

export const createParticipation = async (participationData) => {
    const validation = validateParticipationData(participationData);
    if (!validation.isValid) {
        return { success: false, error: 'Erro de validação', details: validation.errors };
    }

    const memberExists = await getMemberById(participationData.memberId);
    if (!memberExists) {
        return { success: false, error: 'Membro não encontrado' };
    }

    const recordedByExists = await getMemberById(participationData.recordedById);
    if (!recordedByExists) {
        return { success: false, error: 'Membro que registrou não encontrado' };
    }

    return dbCreateParticipation(participationData);
};

export const createBulkParticipations = async (participationsData) => {
    const validation = validateBulkParticipationsData(participationsData);
    if (!validation.isValid) {
        return { success: false, error: 'Erro de validação', details: validation.errors };
    }

    const memberValidation = await validateMembersExist(participationsData.memberIds);
    if (!memberValidation.isValid) {
        return { success: false, error: 'Membros não encontrados', details: memberValidation.errors };
    }

    const recordedByExists = await getMemberById(participationsData.recordedById);
    if (!recordedByExists) {
        return { success: false, error: 'Membro que registrou não encontrado' };
    }

    const participations = participationsData.memberIds.map((memberId) => ({
        memberId,
        sessionId: participationsData.sessionId,
        participationStatus: participationsData.participationStatus,
        absenceReason: participationsData.absenceReason,
        recordedById: participationsData.recordedById
    }));

    return dbCreateBulkParticipations(participations);
};

export const updateParticipation = async (id, participationData) => {
    const validation = validateParticipationUpdateData(participationData);
    if (!validation.isValid) {
        return { success: false, error: 'Erro de validação', details: validation.errors };
    }

    const existingParticipation = await dbGetParticipationById(id);
    if (!existingParticipation) {
        return { success: false, error: 'Participação não encontrada' };
    }

    const participation = await dbUpdateParticipation(id, participationData);
    return { success: true, data: participation };
};

export const deleteParticipation = async (id) => {
    const existingParticipation = await dbGetParticipationById(id);
    if (!existingParticipation) {
        return { success: false, error: 'Participação não encontrada' };
    }

    const participation = await dbDeleteParticipation(id);
    return { success: true, data: participation };
};

const validateParticipationData = (participationData) => {
    const errors = [];

    if (!participationData.memberId) {
        errors.push('ID do membro é obrigatório');
    }

    if (!participationData.sessionId) {
        errors.push('ID da sessão é obrigatório');
    }

    if (!participationData.participationStatus) {
        errors.push('Status de participação é obrigatório');
    } else if (!['present', 'late', 'absent'].includes(participationData.participationStatus)) {
        errors.push('Status de participação deve ser: present, late ou absent');
    }

    if (!participationData.recordedById) {
        errors.push('ID de quem registrou é obrigatório');
    }

    if (participationData.participationStatus === 'absent' && !participationData.absenceReason?.trim()) {
        errors.push('Motivo da ausência é obrigatório quando status é absent');
    }

    if (participationData.absenceReason && participationData.absenceReason.length > 500) {
        errors.push('Motivo da ausência não pode exceder 500 caracteres');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

const validateParticipationUpdateData = (participationData) => {
    const errors = [];

    if (participationData.participationStatus && !['present', 'late', 'absent'].includes(participationData.participationStatus)) {
        errors.push('Status de participação deve ser: present, late ou absent');
    }

    if (participationData.participationStatus === 'absent' && !participationData.absenceReason?.trim()) {
        errors.push('Motivo da ausência é obrigatório quando status é absent');
    }

    if (participationData.absenceReason && participationData.absenceReason.length > 500) {
        errors.push('Motivo da ausência não pode exceder 500 caracteres');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

const validateBulkParticipationsData = (participationsData) => {
    const errors = [];

    if (!participationsData.memberIds || !Array.isArray(participationsData.memberIds) || participationsData.memberIds.length === 0) {
        errors.push('Lista de membros é obrigatória e deve conter pelo menos um membro');
    }

    if (!participationsData.sessionId) {
        errors.push('ID da sessão é obrigatório');
    }

    if (!participationsData.participationStatus) {
        errors.push('Status de participação é obrigatório');
    } else if (!['present', 'late', 'absent'].includes(participationsData.participationStatus)) {
        errors.push('Status de participação deve ser: present, late ou absent');
    }

    if (!participationsData.recordedById) {
        errors.push('ID de quem registrou é obrigatório');
    }

    if (participationsData.participationStatus === 'absent' && !participationsData.absenceReason?.trim()) {
        errors.push('Motivo da ausência é obrigatório quando status é absent');
    }

    if (participationsData.absenceReason && participationsData.absenceReason.length > 500) {
        errors.push('Motivo da ausência não pode exceder 500 caracteres');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

const validateMembersExist = async (memberIds) => {
    const errors = [];
    const notFoundMembers = [];

    for (const memberId of memberIds) {
        const member = await getMemberById(memberId);
        if (!member) {
            notFoundMembers.push(memberId);
        }
    }

    if (notFoundMembers.length > 0) {
        errors.push(`Membros não encontrados: ${notFoundMembers.join(', ')}`);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// eslint-disable-next-line max-lines-per-function
export const processParticipationImages = async (imageFiles, customDate = null) => {
    try {
        const members = await getAllMembers();
        const recognizedNames = new Set();
        const processedImages = [];

        for (const file of imageFiles) {
            try {
                const {
                    data: { text }
                } = await Tesseract.recognize(file.buffer, 'por');

                console.log(`\n=== Processando imagem: ${file.originalname} ===`);
                console.log('Texto extraído:', text.substring(0, 300));

                const foundNames = [];
                const extractedText = text.toLowerCase();
                const cleanedText = extractedText.replace(/[^\w\sáàâãéèêíìîóòôõúùûç]/gi, ' ');
                const words = cleanedText.split(/\s+/).filter((word) => word.length >= 3);

                console.log('Palavras extraídas:', words.slice(0, 20));

                for (const member of members) {
                    const memberName = member.family_name;
                    const memberNameLower = memberName.toLowerCase();
                    const memberWords = memberNameLower.split(/\s+/).filter((word) => word.length >= 3);

                    let matchScore = 0;
                    let totalPossibleScore = memberWords.length;

                    if (totalPossibleScore === 0) continue;

                    if (extractedText.includes(memberNameLower)) {
                        console.log(`✓ Match exato encontrado: ${memberName}`);
                        foundNames.push(memberName);
                        recognizedNames.add(member.id);
                        continue;
                    }

                    for (const memberWord of memberWords) {
                        if (memberWord.length < 3) continue;

                        let bestWordMatch = 0;
                        for (const extractedWord of words) {
                            const similarity = calculateStringSimilarity(memberWord, extractedWord);

                            if (similarity >= 0.8) {
                                bestWordMatch = 1;
                                break;
                            } else if (similarity >= 0.6 && memberWord.length >= 4) {
                                bestWordMatch = Math.max(bestWordMatch, 0.7);
                            } else if (extractedWord.includes(memberWord) && memberWord.length >= 4) {
                                bestWordMatch = Math.max(bestWordMatch, 0.5);
                            }
                        }
                        matchScore += bestWordMatch;
                    }

                    const finalScore = matchScore / totalPossibleScore;
                    console.log(`Membro: ${memberName} | Score: ${finalScore.toFixed(2)} | Palavras: ${memberWords.join(', ')}`);

                    if (finalScore >= 0.7) {
                        console.log(`✓ Match por similaridade: ${memberName} (score: ${finalScore.toFixed(2)})`);
                        foundNames.push(memberName);
                        recognizedNames.add(member.id);
                    }
                }

                console.log(`Nomes encontrados na imagem: ${foundNames.join(', ')}`);
                processedImages.push({
                    filename: file.originalname,
                    foundNames,
                    extractedText: text.substring(0, 200),
                    wordCount: words.length
                });
            } catch (ocrError) {
                console.error(`Erro OCR na imagem ${file.originalname}:`, ocrError.message);
                processedImages.push({ filename: file.originalname, foundNames: [], error: ocrError.message });
            }
        }
        const allExtractedNames = [];
        processedImages.forEach((img) => {
            if (img.foundNames) {
                allExtractedNames.push(...img.foundNames);
            }
        });

        const notFoundNames = [];

        processedImages.forEach((img) => {
            if (img.extractedText) {
                const originalText = img.extractedText;
                const words = originalText.split(/\s+/).filter((word) => word.length > 3 && word.match(/^[A-Z][a-zA-Z0-9]*$/));
                words.forEach((word) => {
                    const wordLower = word.toLowerCase();
                    const isRecognizedMember = members.some((member) => {
                        const memberNameLower = member.family_name.toLowerCase();
                        return memberNameLower.includes(wordLower) || wordLower.includes(memberNameLower);
                    });

                    if (!isRecognizedMember && !notFoundNames.includes(word)) {
                        notFoundNames.push(word);
                    }
                });
            }
        });

        if (recognizedNames.size === 0 && notFoundNames.length === 0) {
            return { success: false, error: 'Nenhum nome de membro foi reconhecido nas imagens', details: { processedImages } };
        }
        let brasiliaTime;
        if (customDate) {
            // Usar data fornecida com horário atual de Brasília
            const now = new Date();
            const currentTime = now.toTimeString().split(' ')[0]; // HH:MM:SS
            const customDateTime = new Date(`${customDate}T${currentTime}`);
            brasiliaTime = customDateTime;
        } else {
            // Fallback: usar data/hora atual de Brasília (caso não seja enviada)
            const currentDate = new Date();
            const brasiliaOffset = -3 * 60;
            brasiliaTime = new Date(currentDate.getTime() + brasiliaOffset * 60 * 1000);
        }

        const participationsToCreate = Array.from(recognizedNames).map((memberId) => ({ memberId: memberId, recordedAt: brasiliaTime.toISOString() }));
        const result = await dbCreateBulkParticipations(participationsToCreate);

        const successfulRegistrations = result.data || [];
        const errors = result.errors || [];

        const successfulMembers = successfulRegistrations.map((reg) => {
            const member = members.find((m) => m.id === reg.member_id);
            return member?.family_name || `ID ${reg.member_id}`;
        });

        const alreadyRegisteredMembers = errors
            .filter((err) => err.error.includes('já tem participação'))
            .map((err) => {
                const member = members.find((m) => m.id === err.memberId);
                return member?.family_name || `ID ${err.memberId}`;
            });

        const realErrors = errors.filter((err) => !err.error.includes('já tem participação'));

        let message = '';
        let warnings = [];

        if (successfulRegistrations.length > 0) {
            message = `${successfulRegistrations.length} participação(ões) registrada(s) com sucesso!`;
        }

        if (alreadyRegisteredMembers.length > 0) {
            warnings.push(...alreadyRegisteredMembers.map((name) => `O membro ${name} já tem participação registrada hoje`));
        }

        if (notFoundNames.length > 0) {
            warnings.push(...notFoundNames.slice(0, 5).map((name) => `O nome "${name}" foi encontrado mas não corresponde a nenhum membro cadastrado`));
        }

        if (realErrors.length > 0) {
            const errorDetails = realErrors.map((err) => {
                const member = members.find((m) => m.id === err.memberId);
                return `O membro ${member?.family_name || `ID ${err.memberId}`} teve erro: ${err.error}`;
            });
            return { success: false, error: 'Erro ao processar algumas participações', details: errorDetails.join('\n• ') };
        }

        return {
            success: true,
            data: {
                processedCount: successfulRegistrations.length,
                successfulMembers,
                warnings,
                message,
                processedImages,
                date: brasiliaTime.toISOString()
            }
        };
    } catch (error) {
        return { success: false, error: 'Erro interno ao processar imagens', details: error.message, stack: error.stack };
    }
};
