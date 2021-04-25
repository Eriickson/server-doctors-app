import { Doctor } from "../../../database";
import { Types } from "mongoose";

interface FindDoctorsArgs {
  filter: {
    fullname: string;
    province: string;
    specialty: string;
  };
}

export default {
  Query: {
    async getDoctors() {
      try {
        const doctorFounds = await Doctor.find();

        return {
          doctors: doctorFounds,
        };
      } catch (err) {
        throw new Error(err);
      }
    },
    async getDoctor(_: any, { id }: { id: string }) {
      try {
        const doctorFound = await Doctor.aggregate([
          {
            $match: {
              _id: Types.ObjectId(id),
            },
          },
          {
            $addFields: {
              id: "$_id",
              scoreAvg: {
                $divide: [
                  {
                    $sum: {
                      $map: {
                        input: "$reviews",
                        as: "review",
                        in: "$$review.score",
                      },
                    },
                  },
                  { $size: "$reviews" },
                ],
              },
            },
          },
        ]);

        return {
          doctor: doctorFound[0],
        };
      } catch (err) {
        throw new Error(err);
      }
    },
    async findDoctors(_: any, { filter }: FindDoctorsArgs) {
      let filterMatch: { [key: string]: string | RegExp | object }[] = [{}];

      if (filter.fullname) filterMatch = [...filterMatch, { fullname: new RegExp(filter.fullname) }];
      if (filter.province) filterMatch = [...filterMatch, { province: filter.province }];
      if (filter.specialty) filterMatch = [...filterMatch, { specialties: { $in: [filter.specialty] } }];

      try {
        const doctorFounds = await Doctor.aggregate([
          {
            $project: {
              id: "$_id",
              name: 1,
              lastname: 1,
              province: 1,
              imageNumber: 1,
              fullname: {
                $concat: ["$name", " ", "$lastname"],
              },
              scoreAvg: {
                $divide: [
                  {
                    $sum: {
                      $map: {
                        input: "$reviews",
                        as: "review",
                        in: "$$review.score",
                      },
                    },
                  },
                  { $size: "$reviews" },
                ],
              },
              specialties: 1,
            },
          },
          {
            $match: {
              $and: filterMatch,
            },
          },
        ]);

        console.log(doctorFounds);

        return {
          doctors: doctorFounds,
          count: doctorFounds.length,
        };
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};
