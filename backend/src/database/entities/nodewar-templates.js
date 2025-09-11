import { sql } from '@vercel/postgres';

export const getAllNodeWarTypes = async () => {
    const result = await sql`
        SELECT *
        FROM nodewar_types t1
        INNER JOIN nodewar_configs t2 ON t1.id = t2.nodewar_type_id
        ORDER BY t1.tier ASC
    `;
    return result.rows;
};

export const getNodeWarConfigsByTypeId = async (id) => {
    const result = await sql`
        SELECT *
        FROM nodewar_types t1
        INNER JOIN nodewar_configs t2 ON t1.id = t2.nodewar_type_id
        WHERE t1.id = ${id}
    `;
    return result.rows[0];
};

export const getNodeWarConfigByTypeId = async (id) => {
    const result = await sql`
        SELECT *
        FROM nodewar_configs
        WHERE nodewar_type_id = ${id}
        ORDER by created_at DESC
        LIMIT 1
    `;
    return result.rows[0];
};

export const createNodeWarType = async (nodeWarType) => {
    const result = await sql`
        INSERT INTO
            nodewar_types(name, informative_text, tier)
        VALUES (
            ${nodeWarType.name},
            ${nodeWarType.informative_text},
            ${nodeWarType.tier}
        ) RETURNING *`;
    return result.rows[0];
};

export const updateNodeWarType = async (id, nodeWarType) => {
    console.log(id, nodeWarType);

    const result = await sql`
        UPDATE
            nodewar_types
        SET
            name = ${nodeWarType.name},
            informative_text = ${nodeWarType.informative_text},
            tier = ${nodeWarType.tier}
        WHERE
            id = ${id} RETURNING *`;
    return result.rows[0];
};

export const createNodeWarConfig = async (nodeWarConfig) => {
    const result = await sql`
        INSERT INTO
            nodewar_configs(
                nodewar_type_id, bomber_slots, frontline_slots, ranged_slots, shai_slots, pa_slots, flag_slots, 
                defense_slots, caller_slots, elephant_slots, waitlist, total_slots
            )
        VALUES (
            ${nodeWarConfig.nodewar_type_id},
            ${nodeWarConfig.bomber_slots},
            ${nodeWarConfig.frontline_slots},
            ${nodeWarConfig.ranged_slots},
            ${nodeWarConfig.shai_slots},
            ${nodeWarConfig.pa_slots},
            ${nodeWarConfig.flag_slots},
            ${nodeWarConfig.defense_slots},
            ${nodeWarConfig.caller_slots},
            ${nodeWarConfig.elephant_slots},
            ${nodeWarConfig.waitlist},
            ${nodeWarConfig.total_slots}
        ) RETURNING *`;
    return result.rows[0];
};

export const updateNodeWarConfig = async (id, nodeWarConfig) => {
    const result = await sql`
        UPDATE
            nodewar_configs
        SET
            nodewar_type_id = ${nodeWarConfig.nodewar_type_id},
            bomber_slots = ${nodeWarConfig.bomber_slots},
            frontline_slots = ${nodeWarConfig.frontline_slots},
            ranged_slots = ${nodeWarConfig.ranged_slots},
            shai_slots = ${nodeWarConfig.shai_slots},
            pa_slots = ${nodeWarConfig.pa_slots},
            flag_slots = ${nodeWarConfig.flag_slots},
            defense_slots = ${nodeWarConfig.defense_slots},
            caller_slots = ${nodeWarConfig.caller_slots},
            elephant_slots = ${nodeWarConfig.elephant_slots},
            waitlist = ${nodeWarConfig.waitlist},
            total_slots = ${nodeWarConfig.total_slots}
        WHERE
            id = ${id} RETURNING *`;
    return result.rows[0];
};
