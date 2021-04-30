import { Doctor } from "../../../database";
import faker from "faker";
import { Types } from "mongoose";

interface CreateDoctorArgs {
  doctor: {
    name: string;
    lastname: string;
    yearsExperiences: number;
    specialties: string[];
    ubications: string[];
  };
}

interface ScheduleAppointmentArgs {
  idDoctor: string;
  appointment: {
    date: string;
    schedule: {
      time: string;
      note: string;
    };
  };
}

interface CancelAppointmentArgs {
  idDoctor: string;
  idAppointment: string;
}

export default {
  Mutation: {
    async createDoctor(_: any, { doctor }: CreateDoctorArgs) {
      const count = await Doctor.countDocuments();
      const reviews = Array.from(Array(generateRandom(3, 8))).map(() => ({
        username: faker.internet.userName(),
        comment: faker.lorem.words(generateRandom(30, 50)),
        score: generateRandom(1, 10),
      }));

      const { name, lastname, yearsExperiences, specialties, ubications } = doctor;
      const newDoctor = new Doctor({
        name,
        lastname,
        yearsExperiences,
        specialties,
        ubications,
        reviews,
        imageNumber: count + 1,
      });

      try {
        await newDoctor.save();

        return {
          msg: "Doctor creado satisfactoriamente.",
        };
      } catch (err) {
        throw new Error(err);
      }
    },
    async scheduleAppointment(_: any, { idDoctor, appointment }: ScheduleAppointmentArgs) {
      try {
        const doctorFound: any = await Doctor.aggregate([
          {
            $match: {
              _id: Types.ObjectId(idDoctor),
            },
          },
          {
            $project: {
              calendar: {
                $map: {
                  input: "$calendar",
                  as: "item",
                  in: {
                    $concat: ["$$item.date", " ", "$$item.schedule.time"],
                  },
                },
              },
            },
          },
        ]);

        if (!doctorFound) throw new Error("Este doctor no existe");

        const filterAppointment = doctorFound[0].calendar?.filter(
          (item: any) => item === `${appointment.date} ${appointment.schedule.time}`,
        );

        if (filterAppointment.length) throw new Error("Ya existe una cita para este horario");

        await Doctor.findOneAndUpdate(
          { _id: idDoctor },
          {
            $push: {
              calendar: {
                ...appointment,
                schedule: {
                  ...appointment.schedule,
                  patient: `${faker.name.findName()} ${faker.name.lastName()}`,
                },
              },
            },
          },
        );

        return {
          msg: "Su cita ha sido reservada",
        };
      } catch (err) {
        throw new Error(err);
      }
    },
    async cancelAppointment(_: any, { idDoctor, idAppointment }: CancelAppointmentArgs) {
      try {
        await Doctor.findOneAndUpdate({ _id: idDoctor }, { $pull: { calendar: { _id: idAppointment } } });

        return {
          msg: "Cita cancelada",
        };
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};

function generateRandom(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
