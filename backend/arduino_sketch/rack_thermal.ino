/*
 * Rack Thermal Monitor — Arduino Sketch
 * 
 * Reads 8x DS18B20 sensors and sends JSON over serial.
 * 
 * Wiring: All DS18B20 data pins to Arduino pin 2 (OneWire bus)
 *         4.7kΩ pull-up resistor between data and VCC
 * 
 * Install libraries via Arduino IDE Library Manager:
 *   - OneWire
 *   - DallasTemperature
 */

#include <OneWire.h>
#include <DallasTemperature.h>

#define ONE_WIRE_BUS 2
#define NUM_SENSORS 8
#define READ_INTERVAL 5000  // ms between readings

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// Store sensor addresses (auto-detected on startup)
DeviceAddress sensorAddresses[NUM_SENSORS];
int detectedCount = 0;

void setup() {
  Serial.begin(9600);
  sensors.begin();
  
  detectedCount = min((int)sensors.getDeviceCount(), NUM_SENSORS);
  
  Serial.print("// Detected ");
  Serial.print(detectedCount);
  Serial.println(" sensors");
  
  for (int i = 0; i < detectedCount; i++) {
    sensors.getAddress(sensorAddresses[i], i);
    sensors.setResolution(sensorAddresses[i], 12); // 12-bit = 0.0625°C
  }
}

void loop() {
  sensors.requestTemperatures();
  
  Serial.print("{\"sensors\":[");
  
  for (int i = 0; i < detectedCount; i++) {
    float temp = sensors.getTempC(sensorAddresses[i]);
    
    if (i > 0) Serial.print(",");
    Serial.print("{\"id\":");
    Serial.print(i + 1);
    Serial.print(",\"temp\":");
    Serial.print(temp, 1);
    Serial.print("}");
  }
  
  Serial.println("]}");
  
  delay(READ_INTERVAL);
}
