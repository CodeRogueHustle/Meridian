import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
    "fetch exchange rates hourly",
    { hours: 1 },
    internal.rates.syncRatesInternal
);

export default crons;
