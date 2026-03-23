import { Router, type IRouter } from "express";
import healthRouter from "./health";
import vehiclesRouter from "./vehicles";
import diagnosesRouter from "./diagnoses";
import fuelLogsRouter from "./fuel-logs";
import maintenanceRouter from "./maintenance";
import documentsRouter from "./documents";
import identifyPartRouter from "./identify-part";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/vehicles", vehiclesRouter);
router.use("/diagnoses", diagnosesRouter);
router.use("/fuel-logs", fuelLogsRouter);
router.use("/maintenance", maintenanceRouter);
router.use("/documents", documentsRouter);
router.use("/identify-part", identifyPartRouter);

export default router;
