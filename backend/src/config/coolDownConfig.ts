const coolDownConfig = {
    changeEmail: {
        cooldown: 5 * 60 * 1000,
    },
};

export type CoolDownConfig = typeof coolDownConfig;

export default coolDownConfig;
