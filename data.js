import puppeteer from "puppeteer";


export async function getBlackouts() {

    const url = "https://dp.yasno.com.ua/schedule-turn-off-electricity?utm_source"

    const browser = await puppeteer.launch({
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    }
    );


    // const browser = await puppeteer.launch({
    //     headless: false
    // }
    // );
    const page = await browser.newPage();

    await page.goto(url);

    const dates = await page.evaluate(async () => {
        async function waitFor(time) {
            return new Promise(resolve => setTimeout(resolve, time));
        }

        const group = 3;

        const schedule = document.querySelector(".schedule-item")

        const tabs = schedule.getElementsByClassName("schedule-tab")

        const days = {};

        for (const tab of tabs) {
            tab.click();

            await waitFor(50)

            console.log(tab.textContent)
            const inners = schedule.querySelectorAll(".inner")

            const slice = Array.from(inners).slice(group * 24 - 1, (group + 1) * 24 - 1)

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
                        ranges.push([start - 1, end])
                        start = -1;
                        end = -1;
                    }
                }
            }

            days[tab.textContent.split(" ")[1]] = ranges;

        }

        return days;
    })

    await browser.close()

    console.log(dates)
    return formatTimeRanges(dates);
}

function formatTimeRanges(timeRangesObj) {
    // Helper function to format hours to 12-hour format with AM/PM
    const formatHour = (hour) => {
        const period = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour} ${period}`;
    };

    // Helper function to format date
    const formatDate = (dateStr) => {
        const [day, month, year] = dateStr.split('.');
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return Object.entries(timeRangesObj)
        .map(([date, ranges]) => {
            const formattedRanges = ranges
                .map(([start, end]) =>
                    `${formatHour(start)} - ${formatHour(end)}`
                )
                .join(', ');

            return `${formatDate(date)}: ${formattedRanges}`;
        })
        .join('\n');
}

// const dates = await getBlackouts()
// console.log(dates)