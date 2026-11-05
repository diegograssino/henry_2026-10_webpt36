const celsiusInput = document.getElementById("celsius");
const fahrenheitOutput = document.getElementById("fahrenheit");

celsiusInput.addEventListener("input", () => {
  const celsius = parseFloat(celsiusInput.value);

  if (isNaN(celsius)) {
    fahrenheitOutput.textContent = "32";
    return;
  }

  const fahrenheit = (celsius * 9) / 5 + 32;
  fahrenheitOutput.textContent = fahrenheit.toFixed(1);
});
