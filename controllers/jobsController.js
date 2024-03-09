import Job from "../models/jobs.js";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError } from "../errors/index.js";
import checkPermissions from "../utils/checkPermissions.js";
import mongoose from "mongoose";
import moment from "moment";
import xssFilters from "xss-filters";
import ExcelJS from "exceljs";

const createJob = async (req, res) => {
  const { position, company } = req.body;

  if (!position || !company) {
    throw new BadRequestError("Please Provide All Values");
  }

  req.body.company = xssFilters.inHTMLData(company);
  req.body.position = xssFilters.inHTMLData(position);

  req.body.createdBy = req.user.userId;

  const job = await Job.create(req.body);

  res.status(StatusCodes.CREATED).json({ job });
};

const getAllJobs = async (req, res) => {
  const { search, status, jobType, sort } = req.query;

  req.query.search = xssFilters.inHTMLData(search);

  const queryObject = {
    createdBy: req.user.userId,
  };

  if (status !== "all") {
    queryObject.status = status;
  }

  if (jobType !== "all") {
    queryObject.jobType = jobType;
  }

  if (search) {
    queryObject.position = { $regex: search, $options: "i" };
  }

  let result = Job.find(queryObject);

  if (sort === "latest") {
    result = result.sort("-createdAt");
  }

  if (sort === "oldest") {
    result = result.sort("createdAt");
  }

  if (sort === "a-z") {
    result = result.sort("position");
  }

  if (sort === "z-a") {
    result = result.sort("-position");
  }

  const jobs = await result;

  const totalJobs = await Job.countDocuments(queryObject);

  res.status(StatusCodes.OK).json({ jobs, totalJobs });

  // const page = Number(req.query.page) || 1;
  // const limit = Number(req.query.limit) || 10;
  // const skip = (page - 1) * limit;

  // result = result.skip(skip).limit(limit);

  // const jobs = await result;

  // const totalJobs = await Job.countDocuments(queryObject);

  // const numOfPages = Math.ceil(totalJobs / limit);
  //
  // res.status(StatusCodes.OK).json({ jobs, totalJobs, numOfPages });
  //
};

const updateJob = async (req, res) => {
  const { id: jobId } = req.params;

  const { company, position } = req.body;

  if (!company || !position) {
    throw new BadRequestError("Please Provide All Values");
  }

  req.body.company = xssFilters.inHTMLData(company);
  req.body.position = xssFilters.inHTMLData(position);

  const job = await Job.findOne({ _id: jobId });

  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`);
  }

  checkPermissions(req.user, job.createdBy);

  const updatedJob = await Job.findOneAndUpdate({ _id: jobId }, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(StatusCodes.OK).json({ updatedJob });
};

const deleteJob = async (req, res) => {
  const { id: jobId } = req.params;

  const job = await Job.findOne({ _id: jobId });

  if (!job) {
    throw new NotFoundError(`No job with id: ${jobId}`);
  }

  checkPermissions(req.user, job.createdBy);

  await job.deleteOne();

  res.status(StatusCodes.OK).json({ msg: "Job removed successfully." });
};

const getJobById = async (req, res) => {
  const { id: jobId } = req.params;

  const job = await Job.findOne({ _id: jobId });

  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`);
  }

  checkPermissions(req.user, job.createdBy);

  res.status(StatusCodes.OK).json({ job });
};

const showStats = async (req, res) => {
  let stats = await Job.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  stats = stats.reduce((acc, curr) => {
    const { _id: title, count } = curr;
    acc[title] = count;
    return acc;
  }, {});

  const defaultStats = {
    pending: stats.pending || 0,
    interview: stats.interview || 0,
    declined: stats.declined || 0,
    extended: stats.extended || 0,
  };

  let monthlyApplications = await Job.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
    {
      $group: {
        _id: {
          year: {
            $year: "$createdAt",
          },
          month: {
            $month: "$createdAt",
          },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    { $limit: 6 },
  ]);

  monthlyApplications = monthlyApplications
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item;

      const date = moment()
        .month(month - 1)
        .year(year)
        .format("MMM YYYY");

      return { date, count };
    })
    .reverse();

  res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications });
};

const genexcel = async (req, res) => {
  try {
    const userId = req.user.userId;

    const jobs = await Job.find({ createdBy: userId }).lean();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Jobs");

    worksheet.columns = [
      { header: "Company", key: "company",width:20 },
      { header: "Position", key: "position",width:20 },
      { header: "Status", key: "status" },
      { header: "Job Type", key: "jobType" },
      { header: "Apply date", key: "createdAt", width: 20 },
      { header: "Job Location", key: "jobLocation" },
      { header: "Job Link", key: "jobLink",width:20 },
      { header: "Job Description", key: "jobDescription",width:30 },
      { header: "Referral", key: "isReferral" },
      { header: "RecruiterCall", key: "isRecruiterCall" },
    ];

    jobs.forEach((job) => {
      worksheet.addRow(job);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=jobsheet.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error exporting jobs:", error);
    res.status(500).send("Internal Server Error");
  }
};


//job type stats
const getStats = async (req, res) => {
  let stats = await Job.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
    { $group: { _id: "$jobType", count: { $sum: 1 } } },
  ]);

  stats = stats.reduce((acc, curr) => {
    const { _id: jobType, count } = curr;
    acc[jobType] = count;
    return acc;
  }, {});

  const jobStats = {
    "fulltime": stats["full-time"] || 0,
    "parttime": stats["part-time"] || 0,
    internship: stats.internship || 0,
    remote: stats.remote || 0,
  };


  let dailyApplications = await Job.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" }
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
    { $limit: 10 },
  ]);
  
  dailyApplications = dailyApplications
    .map((item) => {
      const {
        _id: { year, month, day },
        count,
      } = item;
  
      const date = moment()
        .year(year)
        .month(month - 1)
        .date(day)
        .format("MMM DD, YYYY");
  
      return { date, count };
    })
    .reverse();

  res.status(StatusCodes.OK).json({ jobStats, dailyApplications });
};




export {
  createJob,
  getAllJobs,
  updateJob,
  deleteJob,
  getJobById,
  showStats,
  genexcel,
  getStats,
};
