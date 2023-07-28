/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import BillsUI from "../views/BillsUI.js";
import mockedBills from "../__mocks__/store.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import userEvent from "@testing-library/user-event";
import router from "../app/Router.js";
import "@testing-library/jest-dom";

jest.mock("../app/store", () => mockStore);


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    /*On test si le titre est bon*/
    test("Then I should have an good title", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
    });
  });

  /*On test si le format de l'image est correcte*/
  describe("When importing a correct file format", () => {
    test("Then it displays the file name in the input", () =>{
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const html = NewBillUI();
      document.body.innerHTML = html;
      const NewBills = new NewBill({
        document,
        onNavigate,
        localStorage: window.localStorage,
      });
      const handleChangeFile = jest.fn((e) => NewBills.handleChangeFile);
      const inputFile = screen.getByTestId("file");
      inputFile.addEventListener("change", handleChangeFile);
      fireEvent.change(inputFile, {
        target: {
          files: [
            new File(["testfile.jpeg"], "testfile.jpeg", {
              type: "testfile/jpeg",
            }),
          ],
        },
      });
      expect(handleChangeFile).toBeCalled();
      expect(inputFile.files[0].name).toBe("testfile.jpeg");
    });
  });

  /*On test si le format de l'image est incorrect */
  describe("When importing the incorrect file format", () => {
    test("Then the error message is displayed", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const html = NewBillUI();
      document.body.innerHTML = html;
      const NewBills = new NewBill({
        document,
        onNavigate,
        localStorage: window.localStorage,
      });
      const handleChangeFile = jest.fn((e) => NewBills.handleChangeFile);
      const inputFile = screen.getByTestId("file");
      inputFile.addEventListener("change", handleChangeFile);
      const errorAlertSpy = jest.spyOn(window, "alert");
      fireEvent.change(inputFile, {
        target: {
          files: [new File(["image.txt"], "image.txt", { type: "text/txt" })],
        },
      });
      expect(handleChangeFile).toBeCalled();
      expect(inputFile.files[0].name).toBe("image.txt");
      expect(errorAlertSpy).toHaveBeenCalledTimes(1);
    });
  });


  /*On test la méthode POST */
  describe("I submit a valid bill form", () => {
    test("then a bill is created", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });

      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      document.body.innerHTML = NewBillUI({});

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockedBills,
        localStorage: window.localStorage,
      });

      const submit = screen.getByTestId("form-new-bill");

      const validBill = {
        name: "Abonnement Cloud",
        date: "2022-08-30",
        type: "Services en ligne",
        amount: 240,
        pct: 20,
        vat: "40",
        commentary: "",
        fileName: "sample.jpg",
        fileUrl: "https://test.storage.tld/sample.jpg",
      };

      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      document.querySelector(`input[data-testid="expense-name"]`).value =
        validBill.name;
      document.querySelector(`input[data-testid="datepicker"]`).value =
        validBill.date;
      document.querySelector(`select[data-testid="expense-type"]`).value =
        validBill.type;
      document.querySelector(`input[data-testid="amount"]`).value =
        validBill.amount;
      document.querySelector(`input[data-testid="vat"]`).value = validBill.vat;
      document.querySelector(`input[data-testid="pct"]`).value = validBill.pct;
      document.querySelector(`textarea[data-testid="commentary"]`).value =
        validBill.commentary;
      newBill.fileUrl = validBill.fileUrl;
      newBill.fileName = validBill.fileName;
      submit.addEventListener("click", handleSubmit);
      fireEvent.click(submit);

      expect(handleSubmit).toHaveBeenCalledTimes(1);
      expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
      expect(newBill.fileUrl).toBe("https://test.storage.tld/sample.jpg");
    });

    /*On test l'erreur 404 */
    test("Then it fails with a 404 message error", async () => {
      const html = BillsUI({ error: "Erreur 404" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });

    /*On test l'erreur 500 */
    test("Then it fails with a 500 message error", async () => {
      const html = BillsUI({ error: "Erreur 500" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});


