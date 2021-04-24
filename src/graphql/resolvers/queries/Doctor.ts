import { Doctor } from "../../../database";

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
    async findDoctors(_: any, { filter }: FindDoctorsArgs) {
      let filterMatch: { [key: string]: string | RegExp | object }[] = [];

      if (filter.fullname) filterMatch = [...filterMatch, { fullname: new RegExp(filter.fullname) }];
      if (filter.province) filterMatch = [...filterMatch, { province: filter.province }];
      if (filter.specialty) filterMatch = [...filterMatch, { specialties: { $in: [filter.specialty] } }];

      try {
        const doctorFounds = await Doctor.aggregate([
          {
            $project: {
              name: 1,
              lastname: 1,
              imageNumber: 1,
              fullname: {
                $concat: ["$name", " ", "$lastname"],
              },
              specialties: 1,
            },
          },
          {
            $match: {
              $and: filterMatch,
            },
          },
        ]).collation({ locale: "es", strength: 1 });
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
