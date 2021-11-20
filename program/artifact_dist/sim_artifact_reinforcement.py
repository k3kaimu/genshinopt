import numpy as np
import matplotlib.pyplot as plt
import math

from matplotlib import rc
rc('text', usetex=True)

def outputHist(scores, filename):
    mu = np.mean(scores)
    v = np.std(scores)**2
    Max = np.max(scores)

    left_of_first_bin = 0 - 1/2
    right_of_last_bin = Max + 1/2

    fig = plt.figure()
    ax = fig.add_subplot(111)
    ax.hist(scores, bins=np.arange(left_of_first_bin, right_of_last_bin + 1, 1), density=True)
    ax.set_xlabel("Score")
    ax.set_ylabel("Probability Density/Mass Function")
    xs = np.linspace(0, Max, 300)
    ax.plot(xs, 1/np.sqrt(2*math.pi*v) * np.exp(-(xs - mu)**2/(2*v)), label=r"$\mathcal{{N}}(\mu={:.2f},\sigma^2={:.2f})$".format(mu, v))
    ax.legend()
    fig.savefig(filename)


# scale = np.array([16, 4.7, 19, 5.8, 239, 4.7, 19, 5.2, 3.1, 6.2])
scale = np.array([0, 1, 0, 0, 0, 0, 0, 0, 1, 1])

def try_art_reinf():
    idxs = np.linspace(0, 9, 10, dtype=np.int)
    selidxs = np.random.choice(idxs, 4, replace=False)

    counts = np.ones(4)
    for i in np.random.randint(0, 4, size=5):
        counts[i] += 1

    return np.dot(scale[selidxs], counts)
    

Ntrial = 10000
scores = np.array([try_art_reinf() for _ in range(Ntrial)])
outputHist(scores, "single_artifact_score.png")



scores_sum5 = scores.reshape(Ntrial//5, 5).sum(axis=1)
outputHist(scores_sum5, "sum5a_artifact_score.png")
