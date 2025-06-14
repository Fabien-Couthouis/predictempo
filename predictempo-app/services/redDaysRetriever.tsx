const API_URL = "https://www.api-couleur-tempo.fr/api/jourTempo/";
const TODAY_API_URL = `${API_URL}today`;
const TOMORROW_API_URL = `${API_URL}tomorrow`;

export enum TempoColor {
    UNKNOWN = 0,
    BLUE = 1,
    WHITE = 2,
    RED = 3,
    BLUE_OR_WHITE = 4, // result of the prediction is not red but we do not know if it is blue or white
}

class FetchRedDayError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'FetchRedDayError';
    }
}

const processRedDayResponse = async (response: Response): Promise<TempoColor> => {
    if (!response.ok) {
        throw new FetchRedDayError(`Failed to fetch red day data: ${response.statusText}`);
    }

    const content = await response.json();
    // console.log("Retrieved red day data:", content);
    const tempoColor = content.codeJour as TempoColor;
    console.log("Retrieved tempo color:", tempoColor);
    return tempoColor;
}

const colorCache: { [url: string]: TempoColor } = {};

const retrieveColor = async (url: string): Promise<TempoColor> => {
    if (colorCache[url]) {
        return colorCache[url];
    }

    try {
        const response = await fetch(url);
        const color = await processRedDayResponse(response);
        colorCache[url] = color;
        return color;
    } catch (error) {
        console.error("Error fetching red day data:", error);
        return TempoColor.UNKNOWN;
    }
}

export const retrieveTodayColor = async (): Promise<TempoColor> => {
    const res = await retrieveColor(TODAY_API_URL);
    return res;
};

export const retrieveTomorrowColor = async (): Promise<TempoColor> => {
    const res = await retrieveColor(TOMORROW_API_URL);
    return res;
};

export const isThereOneRedDayLastWeek = async (currentDate: Date): Promise<boolean> => {
    const day = currentDate.getDay();

    // Calculate how many days to go back to reach last week's Monday
    const daysToLastMonday = day === 0 ? 6 + 7 : day + 6; // If today is Sunday (0), go back 13 days

    const lastMonday = new Date(currentDate);
    lastMonday.setDate(currentDate.getDate() - daysToLastMonday);

    const lastWeekDays: string[] = [];
    for (let i = 0; i < 5; i++) {
        const day = new Date(lastMonday);
        day.setDate(lastMonday.getDate() + i);
        lastWeekDays.push(day.toISOString().split('T')[0]); // Format as YYYY-MM-DD
    }

    console.debug('last week days:', lastWeekDays);

    for (let i = 0; i < lastWeekDays.length; i++) {
        const url = `${API_URL}${lastWeekDays[i]}`;
        const color = await retrieveColor(url);
        if (color === TempoColor.RED) {
            return true;
        }
    }

    return false;
}