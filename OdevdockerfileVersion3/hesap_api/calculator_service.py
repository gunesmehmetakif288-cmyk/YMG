import math

class CalculatorService:
    def calculate(self, islem, s1, s2=None):
        islem = islem.lower()

        if islem == "toplama": return s1 + s2
        if islem == "çıkarma": return s1 - s2
        if islem == "çarpma": return s1 * s2
        if islem == "bölme": return s1 / s2
        if islem == "üs": return math.pow(s1, s2)
        if islem == "karekök": return math.sqrt(s1)

        raise ValueError("Geçersiz işlem")
