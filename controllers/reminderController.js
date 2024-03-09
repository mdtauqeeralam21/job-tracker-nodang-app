import nodemailer from "nodemailer";
import moment from "moment";
import schedule from 'node-schedule';

const scheduledJobs = {};

const handleReminder = async (req, res) => {
  const { email, formData } = req.body;
  const reminderDate = formData.reminderDate;
  const jobId = formData.jobId;

  if (!email || !formData) {
    return res.status(400).json({ error: "Incomplete data received" });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.PASSWORD,
    },
  });

  const reminderMessage = `
        <p>Hello,</p>
        <p>This is a reminder for your job:</p>
        <p><strong>Company: </strong> ${formData.company}</p>
        <p><strong>Position: </strong> ${formData.position}</p>
        <p><strong>Status: </strong> ${formData.status}</p>
        <p><strong>Type: </strong> ${formData.jobType}</p>
        <p><strong>Location: </strong> ${formData.jobLocation}</p>
        <p><strong>Referral: </strong> ${formData.isReferral}</p>
        <p><strong>Recruiter Call: </strong> ${formData.isRecruiterCall}</p>
        <p>Best regards,</p>
        <p>Your Job Reminder Service</p>
    `;

  const futureDate = moment(reminderDate);

  const cronSchedule = `${futureDate.minute()} ${futureDate.hour()} ${futureDate.date()} ${
    futureDate.month() + 1
  } *`;

  if (jobId && scheduledJobs[jobId]) {
    scheduledJobs[jobId].cancel();
    delete scheduledJobs[jobId];
  }

  const scheduledJob = schedule.scheduleJob(cronSchedule, () => {
    const mailOptions = {
      from: "jonhmiketest22@gmail.com",
      to: email,
      subject: "Job Reminder",
      html: reminderMessage,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });
  });

  if (jobId) {
    scheduledJobs[jobId] = scheduledJob;
  }

  return res.status(200).json({ message: jobId ? "Reminder updated successfully" : "Reminder scheduled successfully" });
};


export {handleReminder}