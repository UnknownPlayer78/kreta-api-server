class API {
  intval(val) {
    let val_types = { "Rossz": 2, "Hanyag": 2, "Változó": 3, "Jó": 4, "Példás": 5 };

    if (val.split("(")[1]) {
      return parseInt(val.split("(")[1].split(")")[0]);
    } else if (Object.keys(val_types).includes(val)) {
      return val_types[val];
    } else {
      return 0;
    }
  }

  get_user_info(user_data) {
    if (!user_data) {
      return {};
    }

    let user = {};

    user.name = user_data.Name;
    user.institute = {
      code: user_data.InstituteCode,
      name: user_data.InstituteName,
    };

    user.birth = {
      place: user_data.PlaceOfBirth,
      date: user_data.DateOfBirthUtc.split("T")[0].replace("Z", ""),
      name: user_data.NameOfBirth
    };
    user.addresses = user_data.AddressDataList;

    user.parents = [];

    user.parents.push({
      id: 0,
      name: user_data.MothersName,
      email: "",
      phone: "",
    });

    user_data.Tutelaries.forEach(parent => {
      user.parents.push({
        id: parent.TutelaryId,
        name: parent.Name,
        email: parent.Email,
        phone: parent.PhoneNumber,
      });
    });

    user.class_teachers = [];
    user.classes = [];

    user_data.Osztalyfonokok.forEach(teacher => {
      user.class_teachers.push({
        id: parseInt(teacher.Uid),
        name: teacher.Tanar.Alkalmazott.Nev,
      });

      teacher.Osztalyai.forEach(class_ => {
        user.classes.push({
          id: parseInt(class_.Uid),
          name: class_.Nev,
        });
      });
    });

    user.groups = [];

    user_data.OsztalyCsoportok.forEach(group => {
      user.groups.push({
        id: parseInt(group.Uid),
        name: group.Nev,
        type: group.OsztalyCsoportTipus == "Osztaly" ?
          'class' : group.OsztalyCsoportTipus == "Csoport" ?
            'group' : group.OsztalyCsoportTipus,
        active: group.isAktiv,
      });
    });

    return user;
  }

  get_evaluations(user_data) {
    if (!user_data) {
      return [];
    }

    let evaluations = [];

    user_data.Evaluations.forEach(evaluation => {
      evaluations.push({
        id: evaluation.EvaluationId,
        value: this.intval(evaluation.Value),
        value_name: evaluation.Value.split("(")[0],
        subject: evaluation.Subject,
        subject_name: evaluation.SubjectCategoryName == "Na" ?
          "" : evaluation.SubjectCategoryName,
        teacher: evaluation.Teacher,
        weight: parseInt(evaluation.Weight.replace("%", "")) / 100,
        description: evaluation.Theme,
        date: evaluation.Date.split("T")[0].replace("Z", ""),
        creation_date: evaluation.CreatingTime.split("T").join(" ").replace("Z", ""),
        type: evaluation.Form.toLowerCase(),
        type_name: evaluation.Mode,
        type_description: evaluation.FormName,
        year: evaluation.Type,
        year_name: evaluation.TypeName,
        is_counted_in: evaluation.IsAtlagbaBeleszamit,
        group: parseInt(evaluation.OsztalyCsoportUid),
      });
    });

    return evaluations;
  }

  get_notes(user_data) {
    if (!user_data) {
      return [];
    }

    let notes = [];

    user_data.Notes.forEach(note => {
      notes.push({
        id: note.NoteId,
        title: note.Title,
        text: note.Content,
        date: note.CreatingTime.split("T").join(" ").replace("Z", ""),
        type: note.Type,
        group: parseInt(note.OsztalyCsoportUid),
      });
    });

    return notes;
  }

  get_absences(user_data) {
    if (!user_data) {
      return [];
    }

    let absences = [];

    user_data.Absences.forEach(absence => {
      absences.push({
        id: absence.AbsenceId,
        teacher: absence.Teacher,
        subject: absence.Subject,
        subject_name: absence.SubjectCategoryName == "Na" ?
          "" : absence.SubjectCategoryName,
        type: absence.Type.toLowerCase(),
        date: absence.CreatingTime.split("T").join(" ").replace("Z", ""),
        delay: absence.DelayTimeMinutes,
        state: absence.JustificationState.toLowerCase(),
        justification: absence.JustificationType.toLowerCase(),
        group: parseInt(absence.OsztalyCsoportUid),
      });
    });

    return absences;
  }

  get_averages(user_data, precise) {
    if (!user_data) {
      return [];
    }

    let averages = {};
    let subjects = {};

    let evaluations = this.get_evaluations(user_data);

    evaluations.forEach(evaluation => {
      if (evaluation.is_counted_in) {
        if (!Object.keys(subjects).includes(evaluation.subject)) {
          subjects[evaluation.subject] = [];
        }

        subjects[evaluation.subject].push(evaluation.value);
      }
    });

    Object.keys(subjects).forEach(subject => {
      let average = subjects[subject].reduce((a, b) =>
        a + b, 0) / subjects[subject].length;
      
      if (!precise) {
        average = Math.round(average * 100) / 100;
      }

      if (!Object.keys(averages).includes(subject)) {
        averages[subject] = {};
      }

      averages[subject]["self"] = average;
    });

    user_data.SubjectAverages.forEach(average => {
      if (Object.keys(averages).includes(average.Subject)) {
        averages[average.Subject]["class"] = average.ClassValue;
      }
    });

    return averages;
  }
}

exports.api = API;