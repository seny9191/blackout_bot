import puppeteer from "puppeteer";


export async function getBlackouts(group) {
    const url = "https://dp.yasno.com.ua/schedule-turn-off-electricity?utm_source"

    const browser = await puppeteer.launch({
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    });

    const page = await browser.newPage();

    await page.goto(url);

    const dates = await page.evaluate(async (group) => {
        async function waitFor(time) {
            return new Promise(resolve => setTimeout(resolve, time));
        }

        const schedule = document.querySelector(".schedule-item")
        const tabs = schedule.getElementsByClassName("schedule-tab")

        const days = {};

        for (const tab of tabs) {
            tab.click();
            await waitFor(50)

            const inners = schedule.querySelectorAll(".inner")
            const slice = Array.from(inners).slice((group - 1) * 24, (group) * 24 - 1)

            const ranges = [];

            let start = -1;
            let end = -1

            for (let i = 0; i < slice.length; i++) {
                if (slice[i].classList.contains("blackout")) {
                    if (start === -1) {
                        start = i;
                    }
                    else {
                        end = i;
                    }
                }
                else {
                    if (end !== -1) {
                        ranges.push([start, end+1])
                        start = -1;
                        end = -1;
                    }
                }
            }

            days[tab.textContent.split(" ").slice(0, -2).join(" ")] = ranges;
        }

        return days;
    }, group)

    await browser.close()

    return formatTimeRanges(dates);
}

function formatTimeRanges(timeRangesObj) {
    const formatHour = (hour) => {
        return `${hour.toString().padStart(2, '0')}:00`;
    };

    return Object.entries(timeRangesObj)
        .map(([date, ranges]) => {
            const formattedRanges = ranges
                .map(([start, end]) =>
                    `${formatHour(start)}-${formatHour(end)}`
                )
                .join(', ');

            return `${date}: ${formattedRanges}`;
        })
        .join('\n');
}